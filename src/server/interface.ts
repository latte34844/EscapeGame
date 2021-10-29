export interface User{
    userName:string,
    userId:string,
    userRole: string,
    userRoom: string, 
    userPosition: string
}

export interface Room {
    obstacle: string[]
    notFree: string[]
    tunnel: string
    warden: string
    player1: User
    player2: User
    prisoner: string
    score: Score
    currentTurn: number
    counter: number
    lastWinner: string
}

export interface Direction {
    right: boolean 
    left: boolean 
    up: boolean 
    down: boolean
}

export interface Score {
    player1: string
    player2: string
    player1Score: number
    player2Score: number
}

export interface Message {
    message: string
    from: string
}

