DRESOVI EURO – GITHUB PAGES KATALOG

Ova verzija je napravljena tako da radi:
KATEGORIJA -> TIM -> SLIKE IZ FOLDERA

NAJBITNIJE:
Ne moraš da praviš posebne HTML stranice za svaki tim.
Dovoljno je da uploaduješ slike u odgovarajući folder na GitHub-u.

-----------------------------------
1) KAKO DA PODIGNEŠ SAJT
-----------------------------------
1. Napravi novi public GitHub repository, npr:
   dresovi-katalog

2. Uploaduj SVE fajlove iz ovog zip-a u repository.

3. Idi na:
   Settings -> Pages

4. Pod Source izaberi:
   Deploy from a branch

5. Pod Branch izaberi:
   main / root

6. Sačuvaj.

7. Posle par minuta dobićeš link:
   https://TVOJUSERNAME.github.io/dresovi-katalog/

-----------------------------------
2) KAKO UBACUJEŠ SLIKE
-----------------------------------
Primer:
Ako hoćeš Arsenal dresove, ubacuješ slike u folder:

catalog/premier-league/arsenal

Ako hoćeš Real Madrid dresove:

catalog/la-liga/real-madrid

Ako hoćeš Partizan Basketball:

catalog/euroleague/partizan-basketball

Slike mogu da budu:
.jpg
.jpeg
.png
.webp

Kad ih uploaduješ i uradiš commit, samo osveži sajt.

-----------------------------------
3) KAKO MENJAŠ WHATSAPP BROJ
-----------------------------------
U fajlu index.html pronađi:
https://wa.me/381600000000

i zameni svojim brojem.

-----------------------------------
4) KAKO MENJAŠ INSTAGRAM
-----------------------------------
U index.html pronađi:
https://www.instagram.com/dresovi__euro/

i promeni ako želiš.

-----------------------------------
5) AKO ŽELIŠ NOVI TIM
-----------------------------------
Ako želiš neki novi tim koji sada ne postoji, treba:
- dodati novi folder u catalog
- dodati naziv tog tima u config.js

-----------------------------------
6) VAŽNO
-----------------------------------
Repository mora da bude PUBLIC da bi GitHub Pages i GitHub API normalno prikazivali slike.

-----------------------------------
7) PRIMER NAJBRŽEG RADA
-----------------------------------
- otvori folder arsenal
- prevuci unutra sve Arsenal slike
- commit
- osveži sajt
- gotovo