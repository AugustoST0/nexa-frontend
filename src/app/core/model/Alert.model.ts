export interface AlertModel {
    id: string;
    type: AlertType;
    message: string;
    title?: string;
    duration?: number;
}

export enum AlertType {
    SUCCESS = 'success',
    ERROR = 'danger',
    WARNING = 'warning',
    INFO = 'info'
}