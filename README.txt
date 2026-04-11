DRESOVI EURO – STABILNA VERZIJA ZA GITHUB PAGES I SVOJ DOMEN

Ova verzija više ne koristi GitHub API za učitavanje slika.
Radi preko fajla manifest.json, zato radi:
- lokalno
- na GitHub Pages
- na custom domenu

KAKO RADI:
1. Ubaciš slike u odgovarajući folder tima.
2. Pokreneš:
   python3 generate_manifest.py
3. To osveži manifest.json
4. Commit + push
5. Sajt prikazuje nove slike

NAJBITNIJE:
Kad dodaš nove slike, obavezno pokreni:
python3 generate_manifest.py

PA ONDA:
git add .
git commit -m "dodate slike"
git push

PRIMER:
Ako ubaciš slike u:
catalog/la-liga/real-madrid

onda pokreneš:
python3 generate_manifest.py

i sajt će prikazati te slike i lokalno i live.

LOCAL PREVIEW:
python3 -m http.server 8000

pa otvori:
http://localhost:8000

KLIK NA SLIKU:
Klik na sliku otvara uvećanu verziju.

CUSTOM DOMEN:
Možeš normalno da dodaš svoj domen, jer ova verzija ne zavisi od github.io linka.