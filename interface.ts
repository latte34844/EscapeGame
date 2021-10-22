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
    prisoner: string
}

export interface Direction {
    right: boolean 
    left: boolean 
    up: boolean 
    down: boolean
}

export interface Score {
    prisonerScore: number
    wardenScore: number
}

