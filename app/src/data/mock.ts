/**
 * Données de démonstration HSM — reprises 1:1 de la maquette web (HSM_Home).
 * Servent de repli quand Supabase n'est pas encore configuré, pour que
 * l'app soit lançable immédiatement (Expo Go) et strictement identique au web.
 */
import type {
  Show, ContentSection, Poll, NotificationItem,
  ContinueWatchingItem, HsmEvent, Partner,
} from '../types';

export const mockNotifications: NotificationItem[] = [
  { id: 'n1', text: 'Haitian Stars LIVE commence dans 15 min', time: 'À l’instant' },
  { id: 'n2', text: 'Nouvel épisode : Sajes ak Vlad est disponible', time: 'Il y a 2h' },
  { id: 'n3', text: 'BAKY Corner revient vendredi 20h', time: 'Hier' },
];

export const mockEvent: HsmEvent = {
  id: 'e1',
  title: 'HSM Live Awards Kreyòl',
  countdown: '4 jours 12h',
};

export const mockShows: Show[] = [
  { id: 's1', title: 'Haitian Stars LIVE', description: 'Interview VLAD — En direct', category: 'INTERVIEW', kind: 'interview', isLive: true, viewers: 12480, premium: false, earlyAccess: false, membersOnly: false },
  { id: 's2', title: 'Sajes ak Vlad', description: 'Ego se pi gwo andikap rap kreyòl', category: 'PODCAST', kind: 'podcast', isLive: true, viewers: 8320, premium: true, earlyAccess: false, membersOnly: false },
  { id: 's3', title: 'Rap Kreyòl Cypher', description: 'Freestyle live ak envite sipriz', category: 'RAP KREYÒL', kind: 'rap_kreyol', isLive: true, viewers: 4210, premium: false, earlyAccess: false, membersOnly: false },
  { id: 's4', title: 'Papi-G Real Talk', description: 'Rezon ki fè li ak Jeff 3 wa pa...', category: 'INTERVIEW', kind: 'interview', isLive: true, viewers: 2670, premium: false, earlyAccess: false, membersOnly: false },
  { id: 's5', title: 'Baky Corner', description: 'Prochaine émission — vendredi 20h', category: 'RAP KREYÒL', kind: 'rap_kreyol', isLive: false, viewers: 0, premium: true, earlyAccess: false, membersOnly: false },
  { id: 's6', title: 'Sajes Net Ale — Débat', description: 'Prochaine émission — dimanche 18h', category: 'DÉBAT', kind: 'debat', isLive: false, viewers: 0, premium: false, earlyAccess: true, membersOnly: false },
];

export const mockContinueWatching: ContinueWatchingItem[] = [
  { id: 'cw1', title: 'Haitian Stars LIVE — Interview VLAD', progress: 0.62, remaining: 'Reste 21 min' },
  { id: 'cw2', title: 'Sajes ak Vlad', progress: 0.30, remaining: 'Reste 51 min' },
  { id: 'cw3', title: 'Papi-G Real Talk', progress: 0.85, remaining: 'Reste 8 min' },
];

export const mockTopSections: ContentSection[] = [
  { title: 'Interviews à ne pas manquer', items: [
    { id: 'v1', title: 'Gno tap fon ti pale ak Sajes Net Ale', meta: 'Interview · 6:37 · 1.3K vues', kind: 'interview', showPlay: true },
    { id: 'v2', title: 'VLAD ENJOY sot nan silans li pou...', meta: 'Interview · 54:20 · 1.7K vues', kind: 'interview', showPlay: true },
  ]},
  { title: 'Podcasts & débats', items: [
    { id: 'v3', title: 'EGO SA A KAY NEG YO SE PI GWO...', meta: 'Podcast · 1:14:01 · 360 vues', kind: 'podcast', showPlay: true },
    { id: 'v4', title: 'SAJES NET ALE KASE MET NAN', meta: 'Débat · 1:01:52 · 5.2K vues', kind: 'debat', showPlay: true },
  ]},
  { title: 'Collaborations', items: [
    { id: 'v5', title: 'D-JA — Mèsi Grenadye Yo (Official...)', meta: 'Clip · 2:36 · 188 vues', kind: 'clip', showPlay: true },
    { id: 'v6', title: 'BAKY Toujou rapè e li ka fe eks...', meta: 'Collab · 8:18 · 1K vues', kind: 'collab', showPlay: true },
  ]},
];

export const mockBottomSections: ContentSection[] = [
  { title: 'Shorts & moments viraux', items: [
    { id: 'v7', title: 'Moment fò nan podcast la 🔥', meta: 'Short · 0:45', kind: 'short', showPlay: true },
    { id: 'v8', title: 'Sajes ak Vlad — punchline', meta: 'Short · 0:32', kind: 'short', showPlay: true },
  ]},
  { title: 'Actualités showbiz kreyòl', items: [
    { id: 'v9', title: 'Rap kreyòl : les alliances qui...', meta: 'Article · 4 min', kind: 'article', showPlay: false },
    { id: 'v10', title: 'Diaspora Weekly — l’agenda de...', meta: 'Newsletter · 6 min', kind: 'newsletter', showPlay: false },
  ]},
];

export const mockPoll: Poll = {
  id: 'p1',
  question: 'Ki pi bon rap kreyòl mwa sa a?',
  totalVotes: 842,
  options: [
    { id: 'a', label: 'BAKY — Toujou rapè', votes: 361 },
    { id: 'b', label: 'D-JA — Mèsi Grenadye Yo', votes: 258 },
    { id: 'c', label: 'Sajes Net Ale — freestyle', votes: 223 },
  ],
};

export const mockPartners: Partner[] = [
  { id: 'pa1', label: 'LOGO' }, { id: 'pa2', label: 'LOGO' },
  { id: 'pa3', label: 'LOGO' }, { id: 'pa4', label: 'LOGO' },
];
