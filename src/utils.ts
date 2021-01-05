import dedent from 'dedent';
import { Request, Response } from 'express';
import fs from 'fs';
import Vue from 'vue';
import { createRenderer } from 'vue-server-renderer';
import { envs } from '@/envs';

export const promiseTimeout = (promise: Promise<any>, ms: number) => {
	// Create a promise that rejects in <ms> milliseconds
	const timeout = new Promise((_resolve, reject) => {
	  const id = setTimeout(() => {
		clearTimeout(id);
		reject(`Timed out in ${ms}ms.`);
	  }, ms);
	});
  
	// Returns a race between our timeout and the passed in promise
	return Promise.race([
	  promise,
	  timeout
	]);
};

export const createVueEndpoint = ({
    templatePath,
    app,
    context = {}
}: {
    templatePath?: string,
    app: Vue,
    context: {}
}) => {
    const template = templatePath ? fs.readFileSync(templatePath, 'utf-8') : dedent`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <title>{{ title }}</title>
                <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
                <style>
                    // Borrowed from https://stackoverflow.com/a/22997770/2311366
                    pre {
                        border-radius: 5px; 
                        -moz-border-radius: 5px; 
                        -webkit-border-radius: 5px;
                        border: 1px solid #BCBEC0;
                        background: #F1F3F5;
                        font:12px Monaco,Consolas,"Andale  Mono","DejaVu Sans Mono",monospace
                    }
                    
                    code {
                        border-radius: 5px; 
                        -moz-border-radius: 5px; 
                        -webkit-border-radius: 5px; 
                        border: 1px solid #BCBEC0;
                        padding: 2px;
                        font:12px Monaco,Consolas,"Andale  Mono","DejaVu Sans Mono",monospace
                    }
                    
                    pre code {
                        border-radius: 0px; 
                        -moz-border-radius: 0px; 
                        -webkit-border-radius: 0px; 
                        border: 0px;
                        padding: 2px;
                        font:12px Monaco,Consolas,"Andale  Mono","DejaVu Sans Mono",monospace
                    }
                </style>
            </head>
            <body>
                <!--vue-ssr-outlet-->
            </body>
        </html>
    `;
    return (_request: Request, response: Response) => {
        return createRenderer({
            template,
        }).renderToString(app, context, (error, html) => {
            if (error) {
                response.status(500).end(envs.NODE_ENV === 'production' ? 'Internal Server Error' : error.message);
                return;
            }
            response.end(html);
        });
    };
};

export const sleep = (seconds: number) => new Promise<void>(resolve => {
    setTimeout(() => resolve(), seconds * 1000);
});
