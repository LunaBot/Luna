export interface Command {
    id: string,
    name: string,
    description: string,
    enabled: boolean,
    command: string,
    allowedRoles: string[],
    deniedRoles: string[],
}

export interface Module {
    id: string,
    name: string,
    description: string,
    commands: Command[],
    broken: boolean,
    internal: boolean,
    enabled: boolean,
    events: string[],
    endpoints: string[],
}