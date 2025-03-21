import { IPacketClient, RecvPacket } from '@/core/packet/client/baseClient';
import { LogStack } from '@/core/packet/context/clientContext';
import { NapCoreContext } from '@/core/packet/context/napCoreContext';
import { PacketLogger } from '@/core/packet/context/loggerContext';

export class WsPacketClient extends IPacketClient {
    private websocket: WebSocket | null = null;
    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts: number = 60; // 现在暂时不可配置
    private readonly clientUrl: string;
    private readonly clientUrlWrap: (url: string) => string = (url: string) => `ws://${url}/ws`;

    private isInitialized: boolean = false;
    private initPayload: { pid: number, recv: string, send: string } | null = null;

    constructor(napCore: NapCoreContext, logger: PacketLogger, logStack: LogStack) {
        super(napCore, logger, logStack);
        this.clientUrl = this.napcore.config.packetServer
            ? this.clientUrlWrap(this.napcore.config.packetServer)
            : this.clientUrlWrap('127.0.0.1:8083');
    }

    check(): boolean {
        if (!this.napcore.config.packetServer) {
            this.logStack.pushLogWarn('wsPacketClient 未配置服务器地址');
            return false;
        }
        return true;
    }

    async init(pid: number, recv: string, send: string): Promise<void> {
        this.initPayload = { pid, recv, send };
        await this.connectWithRetry();
    }

    sendCommandImpl(cmd: string, data: string, trace_id: string): void {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                action: 'send',
                cmd,
                data,
                trace_id
            }));
        } else {
            this.logStack.pushLogWarn(`WebSocket 未连接，无法发送命令: ${cmd}`);
        }
    }

    private async connectWithRetry(): Promise<void> {
        while (this.reconnectAttempts < this.maxReconnectAttempts) {
            try {
                await this.connect();
                return;
            } catch {
                this.reconnectAttempts++;
                this.logStack.pushLogWarn(`第 ${this.reconnectAttempts}/${this.maxReconnectAttempts} 次尝试重连失败！`);
                await this.delay(5000);
            }
        }
        this.logStack.pushLogError(`wsPacketClient 在 ${this.clientUrl} 达到最大重连次数 (${this.maxReconnectAttempts})！`);
        throw new Error(`无法连接到 WebSocket 服务器：${this.clientUrl}`);
    }

    private connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.websocket = new WebSocket(this.clientUrl);
            this.websocket.onopen = () => {
                this.available = true;
                this.reconnectAttempts = 0;
                this.logger.info(`wsPacketClient 已连接到 ${this.clientUrl}`);
                if (!this.isInitialized && this.initPayload) {
                    this.websocket!.send(JSON.stringify({
                        action: 'init',
                        ...this.initPayload
                    }));
                    this.isInitialized = true;
                }
                resolve();
            };
            this.websocket.onclose = () => {
                this.available = false;
                this.logger.warn('WebSocket 连接关闭，尝试重连...');
                reject(new Error('WebSocket 连接关闭'));
            };
            this.websocket.onmessage = (ev: MessageEvent<any>) => this.handleMessage(ev).catch(err => {
                this.logger.error(`处理消息时出错: ${err}`);
            });
            this.websocket.onerror = (event) => {
                this.available = false;
                this.logger.error(`WebSocket 出错: ${event}`);
                this.websocket?.close();
                reject(new Error(`WebSocket 出错: ${event}`));
            };
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async handleMessage(message: MessageEvent): Promise<void> {
        try {
            const json: RecvPacket = JSON.parse(message.data.toString());
            const trace_id_md5 = json.trace_id_md5;
            const action = json?.type ?? 'init';
            const event = this.cb.get(`${trace_id_md5}${action}`);
            if (event) await event(json.data);
        } catch (error) {
            this.logger.error(`解析ws消息时出错: ${(error as Error).message}`);
        }
    }
}
