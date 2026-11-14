import type { Field } from "@/lib/admin-cms-schema";

/** Réglages du site (même forme que le singleton « reglages » de keystatic.config.ts). */
export const REGLAGES: Field[] = [
 {
  "name": "email",
  "label": "E-mail principal",
  "type": "text"
 },
 {
  "name": "emailFonds",
  "label": "E-mail Fonds Eboussi",
  "type": "text"
 },
 {
  "name": "whatsapp",
  "label": "WhatsApp",
  "type": "text"
 },
 {
  "name": "facebook",
  "label": "Facebook",
  "type": "text"
 },
 {
  "name": "x",
  "label": "X / Twitter",
  "type": "text"
 },
 {
  "name": "linkedin",
  "label": "LinkedIn",
  "type": "text"
 },
 {
  "name": "instagram",
  "label": "Instagram",
  "type": "text"
 },
 {
  "name": "youtube",
  "label": "YouTube",
  "type": "text"
 },
 {
  "name": "mentionLegale",
  "label": "Mention légale (pied de page)",
  "type": "textarea",
  "full": true
 },
 {
  "name": "enCours",
  "label": "Bloc « En cours » (page Actualités)",
  "type": "lines",
  "help": "un élément par ligne",
  "full": true
 }
];
