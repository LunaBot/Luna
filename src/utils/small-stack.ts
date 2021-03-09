import cleanStack from 'clean-stack';

export const smallStack = (stack: string) => {
	return cleanStack(stack, {
		pretty: true,
		basePath: process.cwd()
	});
};
