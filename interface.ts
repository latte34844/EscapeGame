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
