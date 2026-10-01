export interface Payment {
  month: string;
  amount: number;
  paid: boolean;
}

export interface Friend {
  id: string;
  name: string;
  payments: Payment[];
}

export const QUOTA_AMOUNT = 10;

export const MONTHS = [
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

export const data: Friend[] = [
  { name: "Alicia Quezada" },
  { name: "Manuel Lituma" },
  { name: "Teresa Lituma" },
  { name: "Galo Jimenez" },
  { name: "Yuliana Vicente" },
  { name: "Paola Vicente" }, 
  { name: "Luis Lituma" },
].map((friend, index) => ({
  id: index.toString(),
  name: friend.name,
  payments: MONTHS.map(month => ({
    month,
    amount: QUOTA_AMOUNT,
    paid: false // Edit this file to true when a friend pays
  }))
}));
