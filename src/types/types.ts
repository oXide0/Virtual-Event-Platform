export interface User {
    name: string;
    password: string;
    about: string;
    email: string;
    accountType: 'customer' | 'creator';
    subscriptions: string[];
    followers?: string[];
    notifications: string[];
    isNotified: boolean;
}

export interface Event {
    id: string;
    name: string;
    about: string;
    mode: string;
    category: string;
    date: string;
    street: string;
    city: string;
    country: string;
    link: string;
    price: number;
    creatorId: string;
    img: string;
}

export interface EventsFilter {
    datePosted: 'any' | 'this-week' | 'this-month' | 'this-year';
    country: string;
    mode: 'all' | 'online' | 'offline';
    category: string;
    price: 'all' | 'free' | 'paid';
}
