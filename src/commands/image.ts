import fetch, { Response } from 'node-fetch';
import { Message } from 'discord.js';
import pluralize from 'pluralize';
import { Command } from '../command';
import { AppError } from '../errors';

type DataManager = (response: Response) => Promise<any>;

class Image extends Command {
    public name = 'image';
    public command = 'image';
    public timeout = 3000;
    public description = 'Get an image';
    public hidden = false;
    public owner = false;
    public examples = [ '!image' ];
    public roles = [ '@everyone' ];

    private endpoints = [
        'https://api.thecatapi.com/v1/images/search',
        'https://dog.ceo/api/breeds/image/random',
        'https://source.unsplash.com/random'
    ];
    private dataManagers = {
        'api.thecatapi.com': (response: Response) => response.json().then(json => json[0].url),
        'dog.ceo': (response: Response) => response.json().then(json => json.message),
        'source.unsplash.com': (response: Response) => response.url
    };

    private tags = {
        cats: [
            this.endpoints[0]
        ],
        dogs: [
            this.endpoints[1]
        ],
        random: [
            this.endpoints[2]
        ]
    };
    
    private getDataManager(name: keyof Image['dataManagers']) {
        return this.dataManagers[name] as DataManager;
    }

    private async getImage(url: string) {
        // Get an image
        const endpoint = new URL(url);
        const response = await fetch(endpoint.toString()).catch(() => undefined);

        // API error
        if (!response) {
            throw new AppError('No images found. :disappointed:');
        }

        // Return image
        const hasDataManager = Object.keys(this.dataManagers).includes(endpoint.host);
        const hostname = endpoint.host as keyof Image['dataManagers'];
        return hasDataManager ? this.getDataManager(hostname)(response) : response;
    }

    private getImageUrl(tag: keyof Image['tags']) {
        // Random
        if (tag === 'random') {
            return this.endpoints[Math.floor(Math.random() * this.endpoints.length)];
        }

        // Tag
        if (Object.keys(this.tags).includes(tag)) {
            return this.tags[tag][Math.floor(Math.random() * this.tags[tag].length)];
        }
    }

    // !image
    // !image tags
    // !image endpoints
    // !image cat
    // !image dog
    // !image random
    async handler(_prefix: string, _message: Message, args: string[]) {
        // !image
        if (args.length !== 1) {
            const url = this.getImageUrl('random')!;
            return this.getImage(url);
        }

        // !image tags
        if (args[0] === 'tags') {
            return Object.entries(this.tags).map(([tag, endpoints]) => {
                return `${tag}: [${endpoints.map(endpoint => `\`${endpoint}\``).join(', ')}]`;
            }).join('\n');
        }

        // !image endpoints
        if (args[0] === 'endpoints') {
            return Object.values(this.endpoints).map(endpoint => `\`${endpoint}\``).join(', ');
        }

        // !image cat
        // !image dog
        // !image random
        const tag = args[0] as keyof Image['tags'];
        if (Object.keys(this.tags).includes(tag) || Object.keys(this.tags).includes(pluralize(tag)) || Object.keys(this.tags).includes(pluralize.singular(tag))) {
            const url = this.getImageUrl(tag) ?? this.getImageUrl(pluralize(tag)) ?? this.getImageUrl(pluralize.singular(tag));
            return this.getImage(url!);
        }
    } 
};

export default new Image();