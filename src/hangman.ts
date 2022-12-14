import GameBase from './game-base';
import GameResult, { ResultType } from './game-result';
import fetch from 'node-fetch';
import { GameContent } from './game-content';
import { DiscordMessage, DiscordUser, DiscordEmbed, DiscordMessageReactionAdd, DiscordInteraction } from 'discord-minimal';

//unicode fun...
const reactions = new Map([
    ['đ°ī¸', 'A'],
    ['đĻ', 'A'],
    ['đąī¸', 'B'],
    ['đ§', 'B'],
    ['đ¨', 'C'],
    ['đŠ', 'D'],
    ['đĒ', 'E'],
    ['đĢ', 'F'],
    ['đŦ', 'G'],
    ['đ­', 'H'],
    ['âšī¸', 'I'],
    ['đŽ', 'I'],
    ['đ¯', 'J'],
    ['đ°', 'K'],
    ['đą', 'L'],
    ['âī¸', 'M'],
    ['đ˛', 'M'],
    ['đŗ', 'N'],
    ['đžī¸', 'O'],
    ['â­', 'O'],
    ['đ´', 'O'],
    ['đŋī¸', 'P'],
    ['đĩ', 'P'],
    ['đļ', 'Q'],
    ['đˇ', 'R'],
    ['đ¸', 'S'],
    ['đš', 'T'],
    ['đē', 'U'],
    ['đģ', 'V'],
    ['đŧ', 'W'],
    ['âī¸', 'X'],
    ['â', 'X'],
    ['â', 'X'],
    ['đŊ', 'X'],
    ['đž', 'Y'],
    ['đ¤', 'Z'],
    ['đŋ', 'Z'],
]);

export default class HangmanGame extends GameBase {
    private word = '';
    private guessed: string[] = [];
    private wrongs = 0;

    constructor() {
        super('hangman', false);
    }

    public newGame(interaction: DiscordInteraction, player2: DiscordUser | null, onGameEnd: (result: GameResult) => void): void {
        if (this.inGame)
            return;

        fetch('https://api.theturkey.dev/randomword').then(resp => resp.text())
            .then(word => {
                this.word = word.toUpperCase();
                this.guessed = [];
                this.wrongs = 0;

                super.newGame(interaction, player2, onGameEnd);
            }).catch(console.log);
    }

    protected getContent(): GameContent {
        return {
            embeds: [new DiscordEmbed()
                .setColor('#db9a00')
                .setTitle('Hangman')
                .setAuthor('Made By: TurkeyDev', 'https://site.theturkey.dev/images/turkey_avatar.png', 'https://www.youtube.com/watch?v=0G3gD4KJ59U')
                .setDescription(this.getDescription())
                .addField('Letters Guessed', this.guessed.length == 0 ? '\u200b' : this.guessed.join(' '))
                .addField('How To Play', 'React to this message using the emojis that look like letters (đ°ī¸, đš, )')
                .setFooter(`Currently Playing: ${this.gameStarter.username}`)
                .setTimestamp()]
        };
    }

    protected getGameOverContent(result: GameResult): GameContent {
        return {
            embeds: [new DiscordEmbed()
                .setColor('#db9a00')
                .setTitle('Hangman')
                .setAuthor('Made By: TurkeyDev', 'https://site.theturkey.dev/images/turkey_avatar.png', 'https://www.youtube.com/watch?v=0G3gD4KJ59U')
                .setDescription(`${this.getWinnerText(result)}\n\nThe Word was:\n${this.word}\n\n${this.getDescription()}`)
                .setTimestamp()]
        };
    }

    private makeGuess(reaction: string) {
        if (reactions.has(reaction)) {
            const letter = reactions.get(reaction);
            if (letter === undefined)
                return;

            if (!this.guessed.includes(letter)) {
                this.guessed.push(letter);

                if (this.word.indexOf(letter) == -1) {
                    this.wrongs++;

                    if (this.wrongs == 5) {
                        this.gameOver({ result: ResultType.LOSER, name: this.gameStarter.username, score: this.word });
                        return;
                    }
                }
                else if (!this.word.split('').map(l => this.guessed.includes(l) ? l : '_').includes('_')) {
                    this.gameOver({ result: ResultType.WINNER, name: this.gameStarter.username, score: this.word });
                    return;
                }
            }
        }

        this.step(true);
    }

    private getDescription(): string {
        return '```'
            + '|âžâžâžâžâžâž|   \n|     '
            + (this.wrongs > 0 ? 'đŠ' : ' ')
            + '   \n|     '
            + (this.wrongs > 1 ? 'đ' : ' ')
            + '   \n|     '
            + (this.wrongs > 2 ? 'đ' : ' ')
            + '   \n|     '
            + (this.wrongs > 3 ? 'đŠŗ' : ' ')
            + '   \n|    '
            + (this.wrongs > 4 ? 'đđ' : ' ')
            + '   \n|     \n|__________\n\n'
            + this.word.split('').map(l => this.guessed.includes(l) ? l : '_').join(' ')
            + '```';
    }

    public onReaction(reaction: DiscordMessageReactionAdd): void {
        const reactName = reaction.emoji.name;
        if (reactName)
            this.makeGuess(reactName);
        else
            this.step(true);
    }

    public onInteraction(interaction: DiscordInteraction): void { }
}