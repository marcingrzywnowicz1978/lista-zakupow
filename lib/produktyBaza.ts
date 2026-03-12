export interface ProduktBaza {
  nazwa: string;
  kategoria: string;
  jednostka: string;
  cena: number;
}

export const PRODUKTY_BAZA: ProduktBaza[] = [
  // Pieczywo
  { nazwa: "Chleb pszenny", kategoria: "Pieczywo", jednostka: "szt.", cena: 4.50 },
  { nazwa: "Chleb żytni", kategoria: "Pieczywo", jednostka: "szt.", cena: 4.90 },
  { nazwa: "Bułki pszenne", kategoria: "Pieczywo", jednostka: "szt.", cena: 0.80 },
  { nazwa: "Bagietka", kategoria: "Pieczywo", jednostka: "szt.", cena: 3.50 },
  { nazwa: "Chleb tostowy", kategoria: "Pieczywo", jednostka: "opak.", cena: 5.20 },
  { nazwa: "Rogale maślane", kategoria: "Pieczywo", jednostka: "szt.", cena: 1.20 },
  // Nabiał
  { nazwa: "Mleko 3.2%", kategoria: "Nabiał", jednostka: "l", cena: 3.20 },
  { nazwa: "Mleko 2%", kategoria: "Nabiał", jednostka: "l", cena: 2.90 },
  { nazwa: "Jogurt naturalny", kategoria: "Nabiał", jednostka: "szt.", cena: 2.50 },
  { nazwa: "Jogurt grecki", kategoria: "Nabiał", jednostka: "szt.", cena: 3.90 },
  { nazwa: "Masło", kategoria: "Nabiał", jednostka: "szt.", cena: 7.50 },
  { nazwa: "Ser żółty gouda", kategoria: "Nabiał", jednostka: "kg", cena: 28.00 },
  { nazwa: "Ser biały", kategoria: "Nabiał", jednostka: "szt.", cena: 5.50 },
  { nazwa: "Śmietana 18%", kategoria: "Nabiał", jednostka: "szt.", cena: 3.20 },
  { nazwa: "Jajka", kategoria: "Nabiał", jednostka: "szt.", cena: 0.80 },
  { nazwa: "Kefir", kategoria: "Nabiał", jednostka: "szt.", cena: 3.50 },
  { nazwa: "Maślanka", kategoria: "Nabiał", jednostka: "szt.", cena: 2.80 },
  // Warzywa
  { nazwa: "Pomidory", kategoria: "Warzywa", jednostka: "kg", cena: 6.99 },
  { nazwa: "Ogórki", kategoria: "Warzywa", jednostka: "kg", cena: 4.99 },
  { nazwa: "Ziemniaki", kategoria: "Warzywa", jednostka: "kg", cena: 2.50 },
  { nazwa: "Marchew", kategoria: "Warzywa", jednostka: "kg", cena: 3.00 },
  { nazwa: "Cebula", kategoria: "Warzywa", jednostka: "kg", cena: 3.50 },
  { nazwa: "Czosnek", kategoria: "Warzywa", jednostka: "szt.", cena: 1.50 },
  { nazwa: "Papryka czerwona", kategoria: "Warzywa", jednostka: "szt.", cena: 2.50 },
  { nazwa: "Sałata", kategoria: "Warzywa", jednostka: "szt.", cena: 2.99 },
  { nazwa: "Brokuł", kategoria: "Warzywa", jednostka: "szt.", cena: 4.50 },
  { nazwa: "Kalafior", kategoria: "Warzywa", jednostka: "szt.", cena: 5.99 },
  { nazwa: "Pieczarki", kategoria: "Warzywa", jednostka: "opak.", cena: 4.99 },
  // Owoce
  { nazwa: "Jabłka", kategoria: "Owoce", jednostka: "kg", cena: 4.50 },
  { nazwa: "Banany", kategoria: "Owoce", jednostka: "kg", cena: 5.99 },
  { nazwa: "Pomarańcze", kategoria: "Owoce", jednostka: "kg", cena: 6.99 },
  { nazwa: "Cytryny", kategoria: "Owoce", jednostka: "szt.", cena: 1.20 },
  { nazwa: "Winogrona", kategoria: "Owoce", jednostka: "kg", cena: 12.99 },
  { nazwa: "Truskawki", kategoria: "Owoce", jednostka: "opak.", cena: 8.99 },
  { nazwa: "Gruszki", kategoria: "Owoce", jednostka: "kg", cena: 5.99 },
  // Mięso
  { nazwa: "Filet z kurczaka", kategoria: "Mięso", jednostka: "kg", cena: 18.99 },
  { nazwa: "Pierś z kurczaka", kategoria: "Mięso", jednostka: "kg", cena: 19.99 },
  { nazwa: "Mielone wieprzowe", kategoria: "Mięso", jednostka: "kg", cena: 15.99 },
  { nazwa: "Schab wieprzowy", kategoria: "Mięso", jednostka: "kg", cena: 17.99 },
  { nazwa: "Szynka z indyka", kategoria: "Mięso", jednostka: "opak.", cena: 8.49 },
  { nazwa: "Kiełbasa", kategoria: "Mięso", jednostka: "kg", cena: 22.00 },
  { nazwa: "Boczek", kategoria: "Mięso", jednostka: "opak.", cena: 9.99 },
  { nazwa: "Parówki", kategoria: "Mięso", jednostka: "opak.", cena: 7.99 },
  // Napoje
  { nazwa: "Woda mineralna", kategoria: "Napoje", jednostka: "l", cena: 1.50 },
  { nazwa: "Sok pomarańczowy", kategoria: "Napoje", jednostka: "l", cena: 5.99 },
  { nazwa: "Sok jabłkowy", kategoria: "Napoje", jednostka: "l", cena: 4.99 },
  { nazwa: "Ice tea", kategoria: "Napoje", jednostka: "szt.", cena: 2.50 },
  { nazwa: "Cola", kategoria: "Napoje", jednostka: "l", cena: 4.99 },
  { nazwa: "Piwo", kategoria: "Napoje", jednostka: "szt.", cena: 3.50 },
  { nazwa: "Kawa mielona", kategoria: "Napoje", jednostka: "opak.", cena: 18.99 },
  { nazwa: "Herbata czarna", kategoria: "Napoje", jednostka: "opak.", cena: 8.99 },
  // Sypkie
  { nazwa: "Ryż biały", kategoria: "Sypkie", jednostka: "kg", cena: 4.99 },
  { nazwa: "Makaron spaghetti", kategoria: "Sypkie", jednostka: "opak.", cena: 3.50 },
  { nazwa: "Makaron penne", kategoria: "Sypkie", jednostka: "opak.", cena: 3.50 },
  { nazwa: "Mąka pszenna", kategoria: "Sypkie", jednostka: "kg", cena: 3.20 },
  { nazwa: "Cukier", kategoria: "Sypkie", jednostka: "kg", cena: 4.50 },
  { nazwa: "Sól", kategoria: "Sypkie", jednostka: "opak.", cena: 2.00 },
  { nazwa: "Płatki owsiane", kategoria: "Sypkie", jednostka: "opak.", cena: 4.99 },
  { nazwa: "Kasza gryczana", kategoria: "Sypkie", jednostka: "opak.", cena: 5.99 },
  { nazwa: "Olej rzepakowy", kategoria: "Sypkie", jednostka: "l", cena: 7.99 },
  // Mrożonki
  { nazwa: "Warzywa mrożone", kategoria: "Mrożonki", jednostka: "opak.", cena: 5.99 },
  { nazwa: "Frytki mrożone", kategoria: "Mrożonki", jednostka: "opak.", cena: 7.99 },
  { nazwa: "Pizza mrożona", kategoria: "Mrożonki", jednostka: "szt.", cena: 12.99 },
  { nazwa: "Lody", kategoria: "Mrożonki", jednostka: "opak.", cena: 9.99 },
  // Chemia
  { nazwa: "Proszek do prania", kategoria: "Chemia", jednostka: "opak.", cena: 24.99 },
  { nazwa: "Płyn do naczyń", kategoria: "Chemia", jednostka: "szt.", cena: 5.99 },
  { nazwa: "Płyn do WC", kategoria: "Chemia", jednostka: "szt.", cena: 6.99 },
  { nazwa: "Worki na śmieci", kategoria: "Chemia", jednostka: "opak.", cena: 8.99 },
  { nazwa: "Papier toaletowy", kategoria: "Chemia", jednostka: "opak.", cena: 19.99 },
  { nazwa: "Ręczniki papierowe", kategoria: "Chemia", jednostka: "opak.", cena: 9.99 },
  { nazwa: "Płyn do podłóg", kategoria: "Chemia", jednostka: "szt.", cena: 11.99 },
  { nazwa: "Gąbki do naczyń", kategoria: "Chemia", jednostka: "opak.", cena: 4.99 },
  // Kosmetyki
  { nazwa: "Szampon", kategoria: "Kosmetyki", jednostka: "szt.", cena: 12.99 },
  { nazwa: "Pasta do zębów", kategoria: "Kosmetyki", jednostka: "szt.", cena: 7.99 },
  { nazwa: "Szczoteczka do zębów", kategoria: "Kosmetyki", jednostka: "szt.", cena: 9.99 },
  { nazwa: "Dezodorant", kategoria: "Kosmetyki", jednostka: "szt.", cena: 11.99 },
  { nazwa: "Mydło", kategoria: "Kosmetyki", jednostka: "szt.", cena: 4.99 },
  { nazwa: "Żel pod prysznic", kategoria: "Kosmetyki", jednostka: "szt.", cena: 9.99 },
  { nazwa: "Krem do rąk", kategoria: "Kosmetyki", jednostka: "szt.", cena: 8.99 },
];
