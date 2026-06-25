

export enum CardType {
    CardType_None = 0,
    CardType_Attack = 1,
    CardType_Defend = 2,
    CardType_Effect = 3,
    CardType_Counter = 4,
    CardType_Event = 5,
    CardType_Luck = 6,
    CardType_Jinx = 7,
    CardType_Curse = 8,
}
enum RelicQualityType {
  RelicQualityType_None = 0,
  RelicQualityType_Blue = 1,
  RelicQualityType_Purple = 2,
  RelicQualityType_Orange = 3,
}
enum RelicKeyWordType {
  RelicKeyWordType_None = 0,
  RelicKeyWordType_Cure = 1,
  RelicKeyWordType_Salary = 2,
  RelicKeyWordType_Mark = 3,
}
export type Character = {
    id: number,
    hp: number,
    def: number,
    atk: number,
    cd: number,
    color: string,
    name: string,
    img: string,
    levels: string[],
    display: {
        icon: string;
        name: string;
        color: Color[];
        related: Tags[];
        teamRelations: TeamRelation[]
    }
}
export type Map = {
    id: number,
    name: string,
}
export type Card = {
    id: number,
    type: CardType,
    name: string,
}
export type Relic = {
    id: number,
    name: string,
    color: RelicQualityType,
    keyword: RelicKeyWordType,
}


export enum TagClass {
    ROLE,
    CHIP,
    TIME,
    ATTACK,
    DEFENSE,
    HP,
    SKILL,
    GOLD
}
export enum Color {
    RED,
    YELLOW,
    BLUE,
    GREEN,
    BLACK,
    WHITE
};


export type TeamRelation = {
    description: string
    scale?: number
} & (PositionalRelation | ComboRelation | PowerfulIndividualRelation| RoleRelation)

export type PositionalRelation = {
    predicator: "position"
    positions: number[]
}
export type ComboRelation = {
    predicator: "combo"
    targetChars: string[],
    direction?: "before" | "after"
}
export type PowerfulIndividualRelation = {
    predicator: "identity"
}

export type RoleRelation = {
    predicator: "role"
}


function charPair(a: number, b: number) {
    return (Math.min(a, b) << 16) | (Math.max(a, b) & 0xffff);
}
export function getTeamScore(team: Character[]) {
    const calculatedBidi: Set<number> = new Set<number>();
    const records: { description: string, score: number, relatedId: number[] }[] = [];
    for (let i = 0; i < team.length; i++) {
        team[i].display.teamRelations.forEach(tr => {
            if (tr.predicator === "position") {
                if (tr.positions.includes(i + 1)) {
                    records.push({ description: tr.description, score: tr.scale || 1, relatedId: [i] });
                }
            } else if (tr.predicator === "combo") {
                if (tr.direction === "before") {
                    for (let j = i + 1; j < team.length; j++)
                        if (tr.targetChars.includes(team[j].name)) {
                            records.push({ description: tr.description, score: tr.scale || 1, relatedId: [i, j] });
                        }
                } else if (tr.direction === "after") {
                    for (let j = i - 1; j >= 0; j--)
                        if (tr.targetChars.includes(team[j].name)) {
                            records.push({ description: tr.description, score: tr.scale || 1, relatedId: [i, j] });
                        }
                } else {
                    for (let j = 0; j < team.length; j++) {
                        if (j != i && tr.targetChars.includes(team[j].name)) {
                            if (calculatedBidi.has(charPair(i, j))) continue;
                            records.push({ description: tr.description, score: tr.scale || 1, relatedId: [i, j] });
                            calculatedBidi.add(charPair(i, j));
                        }
                    }
                }
            } else if (tr.predicator === "identity") {
                records.push({ description: tr.description, score: tr.scale || 1, relatedId: [i] });
            } else if (tr.predicator === "role") {
                const lastRecord = records.find(r => r.description === tr.description);
                if(lastRecord) {
                    lastRecord.relatedId.push(i);
                    lastRecord.score = Math.max(lastRecord.score, tr.scale || 1);
                }else{
                    records.push({ description: tr.description, score: tr.scale || 1, relatedId: [i] });
                }
            }
        })
    }
    let eco = 0;
    for (let i = 0; i < team.length; i++) {
        if (team[i].display.related.includes("钱辅"))
            eco += 2;
        else if (team[i].display.related.includes("6星币"))
            eco -= 2;
        else if (team[i].display.related.includes("12星币"))
            eco -= 1;
        else if (team[i].display.related.includes("12返10"))
            eco += 1;
    }
    const oEco = eco;
    eco = Math.min(Math.max(Math.ceil(eco / 2), -2), 1);
    if (eco != 0)
        records.push({ description: "经济 " + oEco, score: eco, relatedId: [] });
    return { score: records.reduce((acc, cur) => acc + cur.score, 0), records };
}

export const tags = {"物理":{"type":TagClass.ROLE},
"魔法":{"type":TagClass.ROLE},
"输出":{"type":TagClass.ROLE},
"奶辅":{"type":TagClass.ROLE},
"钱辅":{"type":TagClass.ROLE},
"功能辅":{"type":TagClass.ROLE},
"辅助":{"type":TagClass.ROLE},
"星光":{"type":TagClass.CHIP},
"标记":{"type":TagClass.CHIP},
"治愈":{"type":TagClass.CHIP},
"一期":{"type":TagClass.TIME},
"二期":{"type":TagClass.TIME},
"三期":{"type":TagClass.TIME},
"四期":{"type":TagClass.TIME},
"联动":{"type":TagClass.TIME},
"0攻":{"type":TagClass.ATTACK},
"1攻":{"type":TagClass.ATTACK},
"2攻":{"type":TagClass.ATTACK},
"0防":{"type":TagClass.DEFENSE},
"1防":{"type":TagClass.DEFENSE},
"2防":{"type":TagClass.DEFENSE},
"3防":{"type":TagClass.DEFENSE},
"4防":{"type":TagClass.DEFENSE},
"8血":{"type":TagClass.HP},
"9血":{"type":TagClass.HP},
"10血":{"type":TagClass.HP},
"11血":{"type":TagClass.HP},
"12血":{"type":TagClass.HP},
"13血":{"type":TagClass.HP},
"14血":{"type":TagClass.HP},
"2CD":{"type":TagClass.SKILL},
"3CD":{"type":TagClass.SKILL},
"4CD":{"type":TagClass.SKILL},
"6星币":{"type":TagClass.GOLD},
"12星币":{"type":TagClass.GOLD},
"12返10":{"type":TagClass.GOLD},
};
export type Tags = keyof typeof tags;
export const charMap = {"商业之主:帕露南":101,"古怪神探:芬妮":102,"社恐修女:阿兰娜":103,"暗影忍者:小町":104,"社员叔叔:派德曼":105,"猩红辣妹:帕帕拉":106,"游戏大师:恋":107,"看板娘:米米":108,"垃圾箱:Z3000":109,"肉弹战车:潘大猛":110,"小猎手:墨影":111,"史莱姆:璐璐":112,"旗袍娘:姬梦枫":113,"命运少女:蓝海晴":114,"太刀使:美咲":115,"绿洲女王:娜蒂斯":116,"家政机器人:茉莉":117,"暗区少主:阿尔":118,"午夜闪光:星魅琉华":119,"网络魅影:南希露":120,"新人调查员:凛":121,"机械超人:梅加斯":122,"风水师:姬梦朝":123,"三神御主:照":124,"枪匠:摩西":125,"沼之蛟龙:真梦梓":126,"毒苹果:邦妮":127,"怪力乱神:玲玲":128,"超天酱:超绝最可爱天使酱":301,"糖糖:主播女孩":302,"吉尔:吉尔·斯汀雷":303,"多萝西:多萝西·海兹":304};
export const characterList: Character[] = [{"id":101,"hp":10,"def":2,"atk":1,"cd":2,"color":"#ff92bd","name":"商业之主:帕露南","img":"https://patchwiki.biligame.com/images/starengine/thumb/1/1c/b7anvun0qgvhfgl1hsab13q1d9tpbrt.png/100px-UT_Hero_RolePhoto_101.png","levels":["达到1星时立刻获得10星币","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/1/1c/b7anvun0qgvhfgl1hsab13q1d9tpbrt.png/100px-UT_Hero_RolePhoto_101.png","name":"商业之主:帕露南","color":[0],"related":["1攻","2防","10血","2CD","12返10","钱辅","辅助","功能辅","一期"],"teamRelations":[{"description":"角色强度","scale":1,"predicator":"identity"}]}},
{"id":102,"hp":10,"def":2,"atk":1,"cd":3,"color":"#ffd693","name":"古怪神探:芬妮","img":"https://patchwiki.biligame.com/images/starengine/thumb/6/6b/ewqtgupb3yh1lqt15xasvns3jzqz3ch.png/100px-UT_Hero_RolePhoto_102.png","levels":["达到1星时立刻获得10星币","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/6/6b/ewqtgupb3yh1lqt15xasvns3jzqz3ch.png/100px-UT_Hero_RolePhoto_102.png","name":"古怪神探:芬妮","color":[1],"related":["1攻","2防","10血","3CD","12返10","钱辅","功能辅","辅助","一期"],"teamRelations":[{"description":"角色强度","scale":1,"predicator":"identity"},{"description":"辅助combo","predicator":"combo","direction":"before","targetChars":["毒苹果:邦妮"],"scale":1},{"description":"双向combo","predicator":"combo","targetChars":["新人调查员:凛"],"scale":1}]}},
{"id":103,"hp":9,"def":1,"atk":1,"cd":3,"color":"#e499ff","name":"社恐修女:阿兰娜","img":"https://patchwiki.biligame.com/images/starengine/thumb/f/f9/t28e8s92vbs0o9jw13t131fir8smrnt.png/100px-UT_Hero_RolePhoto_103.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","达到2星时攻击力+2","达到3星时攻击力+1、移动速度+2","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/f/f9/t28e8s92vbs0o9jw13t131fir8smrnt.png/100px-UT_Hero_RolePhoto_103.png","name":"社恐修女:阿兰娜","color":[2],"related":["1攻","1防","9血","3CD","6星币","物理","输出","一期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":104,"hp":9,"def":1,"atk":1,"cd":3,"color":"#647cff","name":"暗影忍者:小町","img":"https://patchwiki.biligame.com/images/starengine/thumb/e/ed/2rem4rn3nd33nytcay9hmfijoitsqnv.png/100px-UT_Hero_RolePhoto_104.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/e/ed/2rem4rn3nd33nytcay9hmfijoitsqnv.png/100px-UT_Hero_RolePhoto_104.png","name":"暗影忍者:小町","color":[0],"related":["1攻","1防","9血","3CD","12星币","魔法","输出","一期"],"teamRelations":[{"description":"角色强度","scale":1,"predicator":"identity"},{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":105,"hp":9,"def":2,"atk":2,"cd":3,"color":"#818ca9","name":"社员叔叔:派德曼","img":"https://patchwiki.biligame.com/images/starengine/thumb/d/db/ifb9aoeadn82x0xj9xvxzx7e4xf8tji.png/100px-UT_Hero_RolePhoto_105.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","达到2星时攻击力+2","达到3星时攻击力+1、移动速度+2","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/d/db/ifb9aoeadn82x0xj9xvxzx7e4xf8tji.png/100px-UT_Hero_RolePhoto_105.png","name":"社员叔叔:派德曼","color":[2],"related":["2攻","2防","9血","3CD","6星币","物理","输出","一期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":106,"hp":10,"def":1,"atk":2,"cd":3,"color":"#e84046","name":"猩红辣妹:帕帕拉","img":"https://patchwiki.biligame.com/images/starengine/thumb/b/b3/f9b6lpe82fmaowcffwo7cfvf8lrm4s2.png/100px-UT_Hero_RolePhoto_106.png","levels":["达到1星时攻击力+1、移动速度+1","达到1星时生命值上限+2","达到2星时攻击力+2","达到3星时攻击力+1、移动速度+2","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/b/b3/f9b6lpe82fmaowcffwo7cfvf8lrm4s2.png/100px-UT_Hero_RolePhoto_106.png","name":"猩红辣妹:帕帕拉","color":[4],"related":["2攻","1防","10血","3CD","6星币","物理","输出","一期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"},{"description":"依赖型combo","predicator":"combo","direction":"before","targetChars":["风水师:姬梦朝"],"scale":1}]}},
{"id":107,"hp":8,"def":1,"atk":2,"cd":3,"color":"#ff2599","name":"游戏大师:恋","img":"https://patchwiki.biligame.com/images/starengine/thumb/1/14/helmqopw0eryy94qatyostcpjyy4huf.png/100px-UT_Hero_RolePhoto_107.png","levels":["达到1星时立刻获得10星币","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/1/14/helmqopw0eryy94qatyostcpjyy4huf.png/100px-UT_Hero_RolePhoto_107.png","name":"游戏大师:恋","color":[2],"related":["2攻","1防","8血","3CD","12返10","功能辅","辅助","一期"],"teamRelations":[{"description":"角色强度","scale":-1,"predicator":"identity"}]}},
{"id":108,"hp":9,"def":1,"atk":1,"cd":3,"color":"#96c8ff","name":"看板娘:米米","img":"https://patchwiki.biligame.com/images/starengine/thumb/9/92/bicolawu44dqputgyhz9nrv3didxdfu.png/100px-UT_Hero_RolePhoto_108.png","levels":["达到1星时立刻获得10星币","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/9/92/bicolawu44dqputgyhz9nrv3didxdfu.png/100px-UT_Hero_RolePhoto_108.png","name":"看板娘:米米","color":[2],"related":["1攻","1防","9血","3CD","12返10","钱辅","辅助","一期"],"teamRelations":[]}},
{"id":109,"hp":10,"def":2,"atk":1,"cd":4,"color":"#ec255f","name":"垃圾箱:Z3000","img":"https://patchwiki.biligame.com/images/starengine/thumb/c/ca/i2is6ho0wlhg4f0sr038iie6wxjh9pl.png/100px-UT_Hero_RolePhoto_109.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","达到2星时攻击力+2","达到3星时攻击力+1、移动速度+2","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/c/ca/i2is6ho0wlhg4f0sr038iie6wxjh9pl.png/100px-UT_Hero_RolePhoto_109.png","name":"垃圾箱:Z3000","color":[0],"related":["1攻","2防","10血","4CD","6星币","物理","输出","一期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":110,"hp":14,"def":0,"atk":1,"cd":3,"color":"#8160f8","name":"肉弹战车:潘大猛","img":"https://patchwiki.biligame.com/images/starengine/thumb/3/3d/gjzvlepcqnck4xoq2iotr1rekd9n75d.png/100px-UT_Hero_RolePhoto_110.png","levels":["达到1星时防御力+1","达到1星时生命值上限+2","达到2星时移动速度+1、生命值上限+1","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/3/3d/gjzvlepcqnck4xoq2iotr1rekd9n75d.png/100px-UT_Hero_RolePhoto_110.png","name":"肉弹战车:潘大猛","color":[4],"related":["1攻","0防","14血","3CD","6星币","奶辅","辅助","一期"],"teamRelations":[{"description":"角色强度","scale":-1,"predicator":"identity"},{"description":"输出","scale":1,"predicator":"role"}]}},
{"id":111,"hp":10,"def":1,"atk":2,"cd":3,"color":"#f5d942","name":"小猎手:墨影","img":"https://patchwiki.biligame.com/images/starengine/thumb/a/a6/61a164av45z04hqm0iw2m9doc4mbzhj.png/100px-UT_Hero_RolePhoto_111.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","达到2星时攻击力+2","达到3星时攻击力+1、移动速度+2","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/a/a6/61a164av45z04hqm0iw2m9doc4mbzhj.png/100px-UT_Hero_RolePhoto_111.png","name":"小猎手:墨影","color":[4],"related":["2攻","1防","10血","3CD","6星币","物理","输出","四期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":112,"hp":9,"def":2,"atk":2,"cd":3,"color":"#aaf4e0","name":"史莱姆:璐璐","img":"https://patchwiki.biligame.com/images/starengine/thumb/9/9c/gdhhfwmmwx1wkj5qpc1zmrna6hnmikg.png/100px-UT_Hero_RolePhoto_112.png","levels":["达到1星时防御力+1","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/9/9c/gdhhfwmmwx1wkj5qpc1zmrna6hnmikg.png/100px-UT_Hero_RolePhoto_112.png","name":"史莱姆:璐璐","color":[3],"related":["2攻","2防","9血","3CD","12星币","奶辅","辅助","治愈","一期"],"teamRelations":[{"description":"双向combo","predicator":"combo","targetChars":["风水师:姬梦朝"],"scale":1}]}},
{"id":113,"hp":10,"def":0,"atk":1,"cd":3,"color":"#fee2ae","name":"旗袍娘:姬梦枫","img":"https://patchwiki.biligame.com/images/starengine/thumb/e/e3/5ti23lz36kcd5o8ji9k3kkr1vqogvzf.png/100px-UT_Hero_RolePhoto_113.png","levels":["达到1星时防御力+1","达到1星时生命值上限+2","达到2星时攻击力+1、移动速度+1","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/e/e3/5ti23lz36kcd5o8ji9k3kkr1vqogvzf.png/100px-UT_Hero_RolePhoto_113.png","name":"旗袍娘:姬梦枫","color":[4],"related":["1攻","0防","10血","3CD","6星币","物理","输出","一期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":114,"hp":10,"def":1,"atk":1,"cd":3,"color":"#c1d9f6","name":"命运少女:蓝海晴","img":"https://patchwiki.biligame.com/images/starengine/thumb/e/e8/h1sbx184vq5vm9n2qdghael8ewpkauq.png/100px-UT_Hero_RolePhoto_114.png","levels":["达到1星时立刻获得10星币","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/e/e8/h1sbx184vq5vm9n2qdghael8ewpkauq.png/100px-UT_Hero_RolePhoto_114.png","name":"命运少女:蓝海晴","color":[2],"related":["1攻","1防","10血","3CD","12返10","钱辅","辅助","功能辅","二期"],"teamRelations":[{"description":"角色强度","scale":1,"predicator":"identity"},{"description":"辅助combo","predicator":"combo","direction":"before","targetChars":["暗影忍者:小町"],"scale":1}]}},
{"id":115,"hp":9,"def":2,"atk":0,"cd":3,"color":"#42abac","name":"太刀使:美咲","img":"https://patchwiki.biligame.com/images/starengine/thumb/0/0d/dh6fdupcwk7qyj7f47hy3zzgl3d4xt2.png/100px-UT_Hero_RolePhoto_115.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","达到2星时攻击力+2","达到3星时攻击力+1、移动速度+2","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/0/0d/dh6fdupcwk7qyj7f47hy3zzgl3d4xt2.png/100px-UT_Hero_RolePhoto_115.png","name":"太刀使:美咲","color":[5],"related":["0攻","2防","9血","3CD","6星币","物理","输出","二期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":116,"hp":9,"def":1,"atk":1,"cd":3,"color":"#af94e5","name":"绿洲女王:娜蒂斯","img":"https://patchwiki.biligame.com/images/starengine/thumb/7/72/1kstcnqxfsc8uigt44ajams17o7tyt0.png/100px-UT_Hero_RolePhoto_116.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/7/72/1kstcnqxfsc8uigt44ajams17o7tyt0.png/100px-UT_Hero_RolePhoto_116.png","name":"绿洲女王:娜蒂斯","color":[4],"related":["1攻","1防","9血","3CD","12星币","物理","输出","二期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":117,"hp":9,"def":0,"atk":1,"cd":4,"color":"#b9e486","name":"家政机器人:茉莉","img":"https://patchwiki.biligame.com/images/starengine/thumb/8/8a/3rocf02jljhx6xxiuos0wyh08h8rmu5.png/100px-UT_Hero_RolePhoto_117.png","levels":["达到1星时攻击力+1、移动速度+1","达到1星时生命值上限+2","达到2星时攻击力+2","达到3星时攻击力+1、移动速度+2","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/8/8a/3rocf02jljhx6xxiuos0wyh08h8rmu5.png/100px-UT_Hero_RolePhoto_117.png","name":"家政机器人:茉莉","color":[3],"related":["1攻","0防","9血","4CD","6星币","物理","输出","二期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":118,"hp":9,"def":1,"atk":1,"cd":3,"color":"#fec325","name":"暗区少主:阿尔","img":"https://patchwiki.biligame.com/images/starengine/thumb/0/09/8nzyy5ydl0y9titzavtqe0ortn18d8h.png/100px-UT_Hero_RolePhoto_118.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/0/09/8nzyy5ydl0y9titzavtqe0ortn18d8h.png/100px-UT_Hero_RolePhoto_118.png","name":"暗区少主:阿尔","color":[4],"related":["1攻","1防","9血","3CD","12星币","功能辅","钱辅","辅助","星光","二期"],"teamRelations":[{"description":"角色强度","scale":-1,"predicator":"identity"},{"description":"辅助combo","predicator":"combo","direction":"before","targetChars":["机械超人:梅加斯","暗影忍者:小町","看板娘:米米"],"scale":1}]}},
{"id":119,"hp":9,"def":2,"atk":1,"cd":3,"color":"#ff930e","name":"午夜闪光:星魅琉华","img":"https://patchwiki.biligame.com/images/starengine/thumb/2/2d/dyimj8s9r61ydp0ppszaw5pvaiovaec.png/100px-UT_Hero_RolePhoto_119.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","达到2星时攻击力+2","达到3星时攻击力+1、移动速度+2","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/2/2d/dyimj8s9r61ydp0ppszaw5pvaiovaec.png/100px-UT_Hero_RolePhoto_119.png","name":"午夜闪光:星魅琉华","color":[4],"related":["1攻","2防","9血","3CD","6星币","物理","输出","二期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"},{"description":"角色强度","scale":-1,"predicator":"identity"}]}},
{"id":120,"hp":9,"def":1,"atk":1,"cd":3,"color":"#fa5791","name":"网络魅影:南希露","img":"https://patchwiki.biligame.com/images/starengine/thumb/9/9a/idiolj7h013gbfjo8b8g8illh330bsl.png/100px-UT_Hero_RolePhoto_120.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","达到2星时攻击力+2","达到3星时攻击力+2、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/9/9a/idiolj7h013gbfjo8b8g8illh330bsl.png/100px-UT_Hero_RolePhoto_120.png","name":"网络魅影:南希露","color":[5],"related":["1攻","1防","9血","3CD","6星币","物理","输出","二期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":121,"hp":9,"def":1,"atk":1,"cd":3,"color":"#f0dbbd","name":"新人调查员:凛","img":"https://patchwiki.biligame.com/images/starengine/thumb/b/bb/p3x082xmurhz4iwv8syu7d6hiq2mtad.png/100px-UT_Hero_RolePhoto_121.png","levels":["达到1星时立刻获得10星币","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/b/bb/p3x082xmurhz4iwv8syu7d6hiq2mtad.png/100px-UT_Hero_RolePhoto_121.png","name":"新人调查员:凛","color":[1],"related":["1攻","1防","9血","3CD","12返10","魔法","输出","标记","三期"],"teamRelations":[{"description":"角色强度","scale":1,"predicator":"identity"},{"description":"双向combo","predicator":"combo","targetChars":["毒苹果:邦妮"],"scale":1},{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":122,"hp":9,"def":2,"atk":0,"cd":3,"color":"#d8da3a","name":"机械超人:梅加斯","img":"https://patchwiki.biligame.com/images/starengine/thumb/0/02/m7jy1ahjxry6ew0mkf06w800ekq4iqa.png/100px-UT_Hero_RolePhoto_122.png","levels":["达到1星时防御力+1","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/0/02/m7jy1ahjxry6ew0mkf06w800ekq4iqa.png/100px-UT_Hero_RolePhoto_122.png","name":"机械超人:梅加斯","color":[2],"related":["0攻","2防","9血","3CD","12星币","魔法","输出","三期"],"teamRelations":[{"description":"角色强度","scale":1,"predicator":"identity"},{"description":"输出","scale":1,"predicator":"role"}]}},
{"id":123,"hp":10,"def":1,"atk":1,"cd":3,"color":"#7fb4ad","name":"风水师:姬梦朝","img":"https://patchwiki.biligame.com/images/starengine/thumb/d/d1/6mx9u3rxlkskk9btpq7ibqku6yudm2j.png/100px-UT_Hero_RolePhoto_123.png","levels":["达到1星时防御力+1","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/d/d1/6mx9u3rxlkskk9btpq7ibqku6yudm2j.png/100px-UT_Hero_RolePhoto_123.png","name":"风水师:姬梦朝","color":[4],"related":["1攻","1防","10血","3CD","12星币","奶辅","功能辅","辅助","三期"],"teamRelations":[{"description":"角色强度","scale":1,"predicator":"identity"},{"description":"辅助combo","predicator":"combo","direction":"before","targetChars":["社恐修女:阿兰娜","社员叔叔:派德曼","猩红辣妹:帕帕拉","垃圾箱:Z3000","小猎手:墨影","旗袍娘:姬梦枫","太刀使:美咲","绿洲女王:娜蒂斯","家政机器人:茉莉","午夜闪光:星魅琉华","网络魅影:南希露","三神御主:照","枪匠:摩西","沼之蛟龙:真梦梓","毒苹果:邦妮","怪力乱神:玲玲","糖糖:主播女孩","多萝西:多萝西·海兹"],"scale":1}]}},
{"id":124,"hp":9,"def":1,"atk":2,"cd":3,"color":"#fd7c7f","name":"三神御主:照","img":"https://patchwiki.biligame.com/images/starengine/thumb/a/a9/m2oheea4r90byag4x6q0pd5bojx4ru4.png/100px-UT_Hero_RolePhoto_124.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/a/a9/m2oheea4r90byag4x6q0pd5bojx4ru4.png/100px-UT_Hero_RolePhoto_124.png","name":"三神御主:照","color":[0],"related":["2攻","1防","9血","3CD","12星币","物理","输出","功能辅","辅助","三期"],"teamRelations":[{"description":"辅助combo","predicator":"combo","direction":"before","targetChars":["社恐修女:阿兰娜","社员叔叔:派德曼","猩红辣妹:帕帕拉","垃圾箱:Z3000","小猎手:墨影","旗袍娘:姬梦枫","太刀使:美咲","绿洲女王:娜蒂斯","家政机器人:茉莉","午夜闪光:星魅琉华","网络魅影:南希露","三神御主:照","枪匠:摩西","沼之蛟龙:真梦梓","毒苹果:邦妮","怪力乱神:玲玲","糖糖:主播女孩","多萝西:多萝西·海兹"],"scale":1}]}},
{"id":125,"hp":11,"def":1,"atk":1,"cd":2,"color":"#b0d97b","name":"枪匠:摩西","img":"https://patchwiki.biligame.com/images/starengine/thumb/6/6b/g4lr2ypqj5jkbvzu7yjwd4w2qhfuh5i.png/100px-UT_Hero_RolePhoto_125.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","达到2星时攻击力+2","达到3星时攻击力+1、移动速度+2","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/6/6b/g4lr2ypqj5jkbvzu7yjwd4w2qhfuh5i.png/100px-UT_Hero_RolePhoto_125.png","name":"枪匠:摩西","color":[3],"related":["1攻","1防","11血","2CD","6星币","物理","输出","三期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":126,"hp":9,"def":1,"atk":2,"cd":3,"color":"#7621f5","name":"沼之蛟龙:真梦梓","img":"https://patchwiki.biligame.com/images/starengine/thumb/9/93/l7arbgzzlaix4y3e302iy1vmsuyjuxo.png/100px-UT_Hero_RolePhoto_126.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/9/93/l7arbgzzlaix4y3e302iy1vmsuyjuxo.png/100px-UT_Hero_RolePhoto_126.png","name":"沼之蛟龙:真梦梓","color":[2],"related":["2攻","1防","9血","3CD","12星币","物理","输出","功能辅","辅助","三期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":127,"hp":9,"def":1,"atk":2,"cd":3,"color":"#e15c9b","name":"毒苹果:邦妮","img":"https://patchwiki.biligame.com/images/starengine/thumb/a/a6/snhz2i4i36naaz5i13ihuiunk00t7ev.png/100px-UT_Hero_RolePhoto_127.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/a/a6/snhz2i4i36naaz5i13ihuiunk00t7ev.png/100px-UT_Hero_RolePhoto_127.png","name":"毒苹果:邦妮","color":[5],"related":["2攻","1防","9血","3CD","12星币","物理","输出","钱辅","功能辅","辅助","四期"],"teamRelations":[{"description":"角色强度","scale":1,"predicator":"identity"},{"description":"双向combo","predicator":"combo","targetChars":["新人调查员:凛"],"scale":1},{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":128,"hp":10,"def":2,"atk":2,"cd":3,"color":"#e15c9b","name":"怪力乱神:玲玲","img":"https://patchwiki.biligame.com/images/starengine/thumb/c/c7/o4p16096ikgumr6993dhnxqa50lkjnh.png/100px-UT_Hero_RolePhoto_128.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","达到2星时攻击力+1、移动速度+1","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/c/c7/o4p16096ikgumr6993dhnxqa50lkjnh.png/100px-UT_Hero_RolePhoto_128.png","name":"怪力乱神:玲玲","color":[1],"related":["2攻","2防","10血","3CD","6星币","物理","输出","辅助","功能辅","四期"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"}]}},
{"id":301,"hp":9,"def":1,"atk":0,"cd":3,"color":"","name":"超天酱:超绝最可爱天使酱","img":"https://patchwiki.biligame.com/images/starengine/thumb/0/0a/aq1h2scidws8c9lekzpkcofkruyu4no.png/100px-UT_Hero_RolePhoto_301.png","levels":["达到1星时立刻获得10星币","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/0/0a/aq1h2scidws8c9lekzpkcofkruyu4no.png/100px-UT_Hero_RolePhoto_301.png","name":"超天酱:超绝最可爱天使酱","color":[5],"related":["0攻","1防","9血","3CD","12返10","钱辅","辅助","星光","联动"],"teamRelations":[{"description":"双向combo","predicator":"combo","targetChars":["糖糖:主播女孩"],"scale":1}]}},
{"id":302,"hp":9,"def":4,"atk":1,"cd":3,"color":"","name":"糖糖:主播女孩","img":"https://patchwiki.biligame.com/images/starengine/thumb/c/c4/l7jch9c54yb98coz2op06yd8a9kuuky.png/100px-UT_Hero_RolePhoto_302.png","levels":["达到1星时攻击力+1","达到1星时生命值上限+2","达到2星时攻击力+2","达到3星时攻击力+1、移动速度+2","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/c/c4/l7jch9c54yb98coz2op06yd8a9kuuky.png/100px-UT_Hero_RolePhoto_302.png","name":"糖糖:主播女孩","color":[4],"related":["1攻","4防","9血","3CD","6星币","物理","输出","联动"],"teamRelations":[{"description":"输出","scale":2,"predicator":"role"},{"description":"双向combo","predicator":"combo","targetChars":["超天酱:超绝最可爱天使酱"],"scale":1}]}},
{"id":303,"hp":10,"def":1,"atk":1,"cd":3,"color":"","name":"吉尔:吉尔·斯汀雷","img":"https://patchwiki.biligame.com/images/starengine/thumb/5/55/9k5sw0zroeh2vjd2bky20pjg7x1h361.png/100px-UT_Hero_RolePhoto_303.png","levels":["达到1星时立刻获得10星币","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/5/55/9k5sw0zroeh2vjd2bky20pjg7x1h361.png/100px-UT_Hero_RolePhoto_303.png","name":"吉尔:吉尔·斯汀雷","color":[2],"related":["1攻","1防","10血","3CD","12返10","奶辅","钱辅","功能辅","辅助","联动"],"teamRelations":[{"description":"辅助combo","predicator":"combo","direction":"before","targetChars":["多萝西:多萝西·海兹","家政机器人:茉莉","午夜闪光:星魅琉华"],"scale":1},{"description":"双向combo","predicator":"combo","targetChars":["风水师:姬梦朝"],"scale":1}]}},
{"id":304,"hp":8,"def":0,"atk":1,"cd":2,"color":"","name":"多萝西:多萝西·海兹","img":"https://patchwiki.biligame.com/images/starengine/thumb/b/b8/ltx3ievbibmt4j5f1zsj9iuzqt8q2rq.png/100px-UT_Hero_RolePhoto_304.png","levels":["达到1星时防御力+1","达到1星时生命值上限+2","初始星币+6","达到3星时攻击力+1、防御力+1、移动速度+1","获得2次强化筹码重选次数","获得星星时，额外获得1次强化筹码重选次数"],"display":{"icon":"https://patchwiki.biligame.com/images/starengine/thumb/b/b8/ltx3ievbibmt4j5f1zsj9iuzqt8q2rq.png/100px-UT_Hero_RolePhoto_304.png","name":"多萝西:多萝西·海兹","color":[0],"related":["1攻","0防","8血","2CD","12星币","物理","输出","联动"],"teamRelations":[{"description":"角色强度","scale":1,"predicator":"identity"},{"description":"输出","scale":2,"predicator":"role"}]}}];
export function getCharByName(name: string): Character | undefined {
    return characterList.find(c => c.name === name);

}
export const mapList: Map[] = [{"id":82007,"name":"星趴·梦想号"},
{"id":82008,"name":"御魂庆典"},
{"id":82010,"name":"水乡古镇"},
{"id":82012,"name":"魔法学院"},
{"id":82013,"name":"龙宫游乐园"},
{"id":82014,"name":"幽魂暗巷"},
{"id":82015,"name":"园林中庭"},
{"id":83001,"name":"海选赛运动场"},
{"id":83002,"name":"淘汰赛运动场"},
{"id":83003,"name":"决赛大赛场"}];

export const cardList: Card[] = [{"id":10001,"type":1,"name":"攻击(中)"},
{"id":10002,"type":2,"name":"防御(中)"},
{"id":10003,"type":1,"name":"攻击(大)"},
{"id":10004,"type":2,"name":"防御(大)"},
{"id":10005,"type":1,"name":"攻击(特大)"},
{"id":10006,"type":2,"name":"防御(特大)"},
{"id":10007,"type":1,"name":"名刀：嘎呜切"},
{"id":10008,"type":1,"name":"暗影突袭"},
{"id":10009,"type":1,"name":"蓄力"},
{"id":10010,"type":1,"name":"全力攻击"},
{"id":10011,"type":1,"name":"毒牙"},
{"id":10012,"type":1,"name":"撕咬"},
{"id":10013,"type":1,"name":"龙之咆哮"},
{"id":20001,"type":3,"name":"激光"},
{"id":20002,"type":3,"name":"巧克力蛋糕"},
{"id":20003,"type":4,"name":"保护屏障"},
{"id":20004,"type":3,"name":"钓鱼执法"},
{"id":20005,"type":3,"name":"遥控骰子"},
{"id":20006,"type":3,"name":"以毒攻毒"},
{"id":20007,"type":3,"name":"灵魂链接"},
{"id":20008,"type":3,"name":"狂暴"},
{"id":20009,"type":3,"name":"自爆"},
{"id":20010,"type":3,"name":"路障"},
{"id":20011,"type":3,"name":"方向抉择"},
{"id":20012,"type":3,"name":"皮筋弹弓"},
{"id":20013,"type":3,"name":"板砖"},
{"id":20014,"type":3,"name":"汉堡"},
{"id":20015,"type":4,"name":"以牙还牙"},
{"id":20017,"type":4,"name":"错误的目标"},
{"id":20018,"type":3,"name":"爆破专家"},
{"id":20019,"type":3,"name":"过期便当"},
{"id":20020,"type":3,"name":"丧心病狂"},
{"id":20021,"type":3,"name":"传递炸弹"},
{"id":20022,"type":3,"name":"抢夺"},
{"id":20023,"type":3,"name":"拾荒"},
{"id":20024,"type":3,"name":"随机传送门"},
{"id":20025,"type":3,"name":"雪球攻击"},
{"id":20026,"type":3,"name":"定向加速"},
{"id":20027,"type":3,"name":"符卡-福"},
{"id":20028,"type":3,"name":"符卡-祸"},
{"id":20029,"type":3,"name":"符卡-祸"},
{"id":20030,"type":3,"name":"活体书页"},
{"id":20031,"type":3,"name":""},
{"id":20032,"type":3,"name":"命运的指引"},
{"id":20033,"type":3,"name":"强化拒止"},
{"id":21001,"type":3,"name":"轨道炮"},
{"id":21002,"type":3,"name":"你有我有"},
{"id":21003,"type":3,"name":"加急加快"},
{"id":21004,"type":3,"name":"王之力"},
{"id":21005,"type":3,"name":"岿然不动"},
{"id":21006,"type":3,"name":"奢华大餐"},
{"id":21007,"type":3,"name":"定向爆破"},
{"id":21008,"type":3,"name":"支援"},
{"id":21009,"type":3,"name":"高升炮"},
{"id":21010,"type":8,"name":"是他干的"},
{"id":21012,"type":3,"name":"对怪激光"},
{"id":21013,"type":3,"name":"对怪板砖"},
{"id":21014,"type":3,"name":"支援口香糖"},
{"id":21015,"type":3,"name":"能量补充棒"},
{"id":21016,"type":3,"name":"大聪明软糖"},
{"id":21017,"type":3,"name":"古怪的附灵物"},
{"id":21018,"type":3,"name":"释放青魂"},
{"id":21019,"type":3,"name":"释放赤魂"},
{"id":21020,"type":3,"name":"彩羽"},
{"id":21021,"type":3,"name":"振作起来"},
{"id":21022,"type":8,"name":"灰烬之羽"},
{"id":21023,"type":3,"name":"吉星高照"},
{"id":21024,"type":3,"name":"人机交融"}];

export const relicList: Relic[] = [{"id":50001,"color":1,"name":"拳击手套-初级","keyword":0},
{"id":50002,"color":2,"name":"拳击手套-中级","keyword":0},
{"id":50003,"color":3,"name":"拳击手套-高级","keyword":0},
{"id":50004,"color":1,"name":"速度轮滑-初级","keyword":0},
{"id":50005,"color":2,"name":"速度轮滑-中级","keyword":0},
{"id":50006,"color":3,"name":"速度轮滑-高级","keyword":0},
{"id":50007,"color":1,"name":"夹心饼干-一般","keyword":0},
{"id":50008,"color":2,"name":"夹心饼干-可口","keyword":0},
{"id":50009,"color":3,"name":"夹心饼干-美味","keyword":0},
{"id":50010,"color":2,"name":"美工刀-初级","keyword":1},
{"id":50011,"color":3,"name":"美工刀-锋利","keyword":1},
{"id":50013,"color":2,"name":"手电筒-强光","keyword":2},
{"id":50014,"color":3,"name":"手电筒-爆闪","keyword":2},
{"id":50015,"color":1,"name":"银行卡-余额少","keyword":2},
{"id":50016,"color":2,"name":"银行卡-余额多","keyword":2},
{"id":50017,"color":3,"name":"银行卡-用不完","keyword":2},
{"id":50018,"color":1,"name":"摩托头盔-一般","keyword":0},
{"id":50019,"color":2,"name":"摩托头盔-中级","keyword":0},
{"id":50020,"color":3,"name":"摩托头盔-高级","keyword":0},
{"id":50021,"color":1,"name":"医疗箱-紧急治疗","keyword":1},
{"id":50022,"color":3,"name":"医疗箱-完备治疗","keyword":1},
{"id":50023,"color":2,"name":"肾上腺素-一般","keyword":0},
{"id":50024,"color":3,"name":"肾上腺素-高效","keyword":0},
{"id":50025,"color":2,"name":"额外电池","keyword":0},
{"id":50026,"color":1,"name":"会员推荐信","keyword":0},
{"id":50027,"color":2,"name":"维生素药丸","keyword":1},
{"id":50028,"color":2,"name":"大背包","keyword":0},
{"id":50029,"color":2,"name":"魔法秘典","keyword":0},
{"id":50030,"color":1,"name":"手持风扇-小","keyword":3},
{"id":50031,"color":2,"name":"智能手表","keyword":0},
{"id":50032,"color":1,"name":"标记喷罐","keyword":3},
{"id":50033,"color":2,"name":"可口糖果","keyword":1},
{"id":50034,"color":3,"name":"大碗炖肉","keyword":1},
{"id":50035,"color":1,"name":"小猪存钱罐","keyword":0},
{"id":50036,"color":1,"name":"“8面”骰子","keyword":2},
{"id":50037,"color":1,"name":"诅咒之剑","keyword":0},
{"id":50038,"color":2,"name":"复仇之戟","keyword":0},
{"id":50039,"color":3,"name":"贯穿之铳","keyword":0},
{"id":50040,"color":1,"name":"缓冲盾牌","keyword":1},
{"id":50041,"color":2,"name":"友情徽章","keyword":1},
{"id":50042,"color":1,"name":"ATM机","keyword":2},
{"id":50043,"color":3,"name":"星币锤","keyword":2},
{"id":50044,"color":3,"name":"鹰眼瞄具","keyword":3},
{"id":50045,"color":3,"name":"忍术飞镖","keyword":3},
{"id":50046,"color":1,"name":"标靶","keyword":3},
{"id":50047,"color":2,"name":"魔法箭袋","keyword":3},
{"id":50048,"color":2,"name":"手持风扇-大","keyword":3},
{"id":50049,"color":1,"name":"佐茶蛋糕","keyword":0},
{"id":50050,"color":2,"name":"古老法杖","keyword":0},
{"id":50051,"color":3,"name":"精品剑盾","keyword":0},
{"id":50052,"color":2,"name":"普通瞄具","keyword":3},
{"id":50053,"color":1,"name":"大铁锚","keyword":0},
{"id":50054,"color":3,"name":"梦想号模型","keyword":0},
{"id":50055,"color":2,"name":"三叉戟","keyword":0},
{"id":50056,"color":1,"name":"惊涛御守","keyword":0},
{"id":50057,"color":1,"name":"迷幻海鲜汤","keyword":0},
{"id":50058,"color":3,"name":"无限之蛇","keyword":0},
{"id":50059,"color":3,"name":"交错双鲤","keyword":0},
{"id":50060,"color":2,"name":"小蛇玩偶","keyword":0},
{"id":50061,"color":2,"name":"小鲤鱼玩偶","keyword":0},
{"id":50062,"color":1,"name":"计时器","keyword":0},
{"id":50063,"color":2,"name":"重生人偶","keyword":0},
{"id":50064,"color":3,"name":"糖果会员证","keyword":0},
{"id":50065,"color":1,"name":"优雅之羽","keyword":0},
{"id":50066,"color":3,"name":"探天卫星","keyword":0},
{"id":50067,"color":3,"name":"飞羽手环","keyword":0},
{"id":50068,"color":2,"name":"鸳鸯玉佩","keyword":0},
{"id":50069,"color":2,"name":"孔雀扇","keyword":0},
{"id":50070,"color":1,"name":"大铜锣","keyword":0},
{"id":50071,"color":3,"name":"节日红包","keyword":0},
{"id":50072,"color":2,"name":"电击枪","keyword":0}];
