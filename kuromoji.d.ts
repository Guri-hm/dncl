declare module "kuromoji" {
    interface Token {
        word_id: number;
        word_type: string;
        word_position: number;
        surface_form: string;
        pos: string;
        pos_detail_1: string;
        pos_detail_2: string;
        pos_detail_3: string;
        conjugated_type: string;
        conjugated_form: string;
        basic_form: string;
        reading: string;
        pronunciation: string;
    }

    interface Tokenizer {
        tokenize(text: string): Token[];
    }

    interface TokenizerBuilder {
        build(callback: (err: any, tokenizer: Tokenizer) => void): void;
    }

    function builder(option?: { dicPath?: string }): TokenizerBuilder;

    interface IpadicFeatures {
        word_id: number;
        word_type: string;
        word_position: number;
        surface_form: string;
        pos: string;
        pos_detail_1: string;
        pos_detail_2: string;
        pos_detail_3: string;
        conjugated_type: string;
        conjugated_form: string;
        basic_form: string;
        reading: string;
        pronunciation: string;
    }

    export {
        Token,
        Tokenizer,
        TokenizerBuilder,
        builder,
        IpadicFeatures
    };
}
