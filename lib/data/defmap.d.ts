export declare enum CardType {
    CardType_None = 0,
    CardType_Attack = 1,
    CardType_Defend = 2,
    CardType_Effect = 3,
    CardType_Counter = 4,
    CardType_Event = 5,
    CardType_Luck = 6,
    CardType_Jinx = 7,
    CardType_Curse = 8
}
declare enum RelicQualityType {
    RelicQualityType_None = 0,
    RelicQualityType_Blue = 1,
    RelicQualityType_Purple = 2,
    RelicQualityType_Orange = 3
}
declare enum RelicKeyWordType {
    RelicKeyWordType_None = 0,
    RelicKeyWordType_Cure = 1,
    RelicKeyWordType_Salary = 2,
    RelicKeyWordType_Mark = 3
}
export type Character = {
    id: number;
    hp: number;
    def: number;
    atk: number;
    cd: number;
    color: string;
    name: string;
    img: string;
    levels: string[];
    display: {
        icon: string;
        name: string;
        color: Color[];
        related: Tags[];
        teamRelations: TeamRelation[];
    };
};
export type Map = {
    id: number;
    name: string;
};
export type Card = {
    id: number;
    type: CardType;
    name: string;
};
export type Relic = {
    id: number;
    name: string;
    color: RelicQualityType;
    keyword: RelicKeyWordType;
};
export declare enum TagClass {
    ROLE = 0,
    CHIP = 1,
    TIME = 2,
    ATTACK = 3,
    DEFENSE = 4,
    HP = 5,
    SKILL = 6,
    GOLD = 7
}
export declare enum Color {
    RED = 0,
    YELLOW = 1,
    BLUE = 2,
    GREEN = 3,
    BLACK = 4,
    WHITE = 5
}
export type TeamRelation = {
    description: string;
    scale?: number;
} & (PositionalRelation | ComboRelation | PowerfulIndividualRelation | RoleRelation);
export type PositionalRelation = {
    predicator: "position";
    positions: number[];
};
export type ComboRelation = {
    predicator: "combo";
    targetChars: string[];
    direction?: "before" | "after";
};
export type PowerfulIndividualRelation = {
    predicator: "identity";
};
export type RoleRelation = {
    predicator: "role";
};
export declare function getTeamScore(team: Character[]): {
    score: number;
    records: {
        description: string;
        score: number;
        relatedId: number[];
    }[];
};
export declare const tags: {
    物理: {
        type: TagClass;
    };
    魔法: {
        type: TagClass;
    };
    输出: {
        type: TagClass;
    };
    奶辅: {
        type: TagClass;
    };
    钱辅: {
        type: TagClass;
    };
    功能辅: {
        type: TagClass;
    };
    辅助: {
        type: TagClass;
    };
    星光: {
        type: TagClass;
    };
    标记: {
        type: TagClass;
    };
    治愈: {
        type: TagClass;
    };
    一期: {
        type: TagClass;
    };
    二期: {
        type: TagClass;
    };
    三期: {
        type: TagClass;
    };
    四期: {
        type: TagClass;
    };
    联动: {
        type: TagClass;
    };
    "0\u653B": {
        type: TagClass;
    };
    "1\u653B": {
        type: TagClass;
    };
    "2\u653B": {
        type: TagClass;
    };
    "0\u9632": {
        type: TagClass;
    };
    "1\u9632": {
        type: TagClass;
    };
    "2\u9632": {
        type: TagClass;
    };
    "3\u9632": {
        type: TagClass;
    };
    "4\u9632": {
        type: TagClass;
    };
    "8\u8840": {
        type: TagClass;
    };
    "9\u8840": {
        type: TagClass;
    };
    "10\u8840": {
        type: TagClass;
    };
    "11\u8840": {
        type: TagClass;
    };
    "12\u8840": {
        type: TagClass;
    };
    "13\u8840": {
        type: TagClass;
    };
    "14\u8840": {
        type: TagClass;
    };
    "2CD": {
        type: TagClass;
    };
    "3CD": {
        type: TagClass;
    };
    "4CD": {
        type: TagClass;
    };
    "6\u661F\u5E01": {
        type: TagClass;
    };
    "12\u661F\u5E01": {
        type: TagClass;
    };
    "12\u8FD410": {
        type: TagClass;
    };
};
export type Tags = keyof typeof tags;
export declare const charMap: {
    "\u5546\u4E1A\u4E4B\u4E3B:\u5E15\u9732\u5357": number;
    "\u53E4\u602A\u795E\u63A2:\u82AC\u59AE": number;
    "\u793E\u6050\u4FEE\u5973:\u963F\u5170\u5A1C": number;
    "\u6697\u5F71\u5FCD\u8005:\u5C0F\u753A": number;
    "\u793E\u5458\u53D4\u53D4:\u6D3E\u5FB7\u66FC": number;
    "\u7329\u7EA2\u8FA3\u59B9:\u5E15\u5E15\u62C9": number;
    "\u6E38\u620F\u5927\u5E08:\u604B": number;
    "\u770B\u677F\u5A18:\u7C73\u7C73": number;
    "\u5783\u573E\u7BB1:Z3000": number;
    "\u8089\u5F39\u6218\u8F66:\u6F58\u5927\u731B": number;
    "\u5C0F\u730E\u624B:\u58A8\u5F71": number;
    "\u53F2\u83B1\u59C6:\u7490\u7490": number;
    "\u65D7\u888D\u5A18:\u59EC\u68A6\u67AB": number;
    "\u547D\u8FD0\u5C11\u5973:\u84DD\u6D77\u6674": number;
    "\u592A\u5200\u4F7F:\u7F8E\u54B2": number;
    "\u7EFF\u6D32\u5973\u738B:\u5A1C\u8482\u65AF": number;
    "\u5BB6\u653F\u673A\u5668\u4EBA:\u8309\u8389": number;
    "\u6697\u533A\u5C11\u4E3B:\u963F\u5C14": number;
    "\u5348\u591C\u95EA\u5149:\u661F\u9B45\u7409\u534E": number;
    "\u7F51\u7EDC\u9B45\u5F71:\u5357\u5E0C\u9732": number;
    "\u65B0\u4EBA\u8C03\u67E5\u5458:\u51DB": number;
    "\u673A\u68B0\u8D85\u4EBA:\u6885\u52A0\u65AF": number;
    "\u98CE\u6C34\u5E08:\u59EC\u68A6\u671D": number;
    "\u4E09\u795E\u5FA1\u4E3B:\u7167": number;
    "\u67AA\u5320:\u6469\u897F": number;
    "\u6CBC\u4E4B\u86DF\u9F99:\u771F\u68A6\u6893": number;
    "\u6BD2\u82F9\u679C:\u90A6\u59AE": number;
    "\u602A\u529B\u4E71\u795E:\u73B2\u73B2": number;
    "\u8D85\u5929\u9171:\u8D85\u7EDD\u6700\u53EF\u7231\u5929\u4F7F\u9171": number;
    "\u7CD6\u7CD6:\u4E3B\u64AD\u5973\u5B69": number;
    "\u5409\u5C14:\u5409\u5C14\u00B7\u65AF\u6C40\u96F7": number;
    "\u591A\u841D\u897F:\u591A\u841D\u897F\u00B7\u6D77\u5179": number;
};
export declare const characterList: Character[];
export declare function getCharByName(name: string): Character | undefined;
export declare const mapList: Map[];
export declare const cardList: Card[];
export declare const relicList: Relic[];
export {};
