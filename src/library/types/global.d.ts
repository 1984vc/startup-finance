interface ProcessEnv {
    VERSION: string;
}

interface Process {
    env: ProcessEnv;
}

declare const process: Process;