export interface User {
  id?: string;
  phone: string;
  name: string;
  lastname: string;
  secondLastname?: string;
  birthdate?: string; // dd/mm/aaaa
}

export type OtpChannel = 'whatsapp' | 'sms';
