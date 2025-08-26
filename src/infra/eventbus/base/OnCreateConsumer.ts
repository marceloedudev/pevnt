import { Exception } from "@/shared/errors/Exception";
import { FileImport } from "@/domain/entity/FileImport";
import { IMessageConsumerBase } from "@/shared/interfaces/IMessageConsumerBase";
import { MessageFactory } from "../factory/MessageFactory";
import { ParserFactory } from "@/infra/acmdp/ParserFactory";

export class OnCreateConsumer {
    private messageConsumer: IMessageConsumerBase;

    constructor({ transport }) {
        this.messageConsumer = new MessageFactory().createMessageConsumer(
            transport
        );
    }

    public async execute({ filename, params, consumers, onExit }) {
        const filetype = new FileImport(filename).detectFileType();

        if (filetype === "unknown") {
            throw new Exception("Invalid type file");
        }

        const argv = new ParserFactory()
            .createArgumentsParser()
            .unparse(params);

        const messager = await this.messageConsumer.register({
            filename,
            filetype,
            params,
            argv,
            consumers,
        });

        await messager.events({
            onExit: async ({ code = 0 }) => {
                await onExit?.({ code });
            },
        });

        return messager;
    }
}
