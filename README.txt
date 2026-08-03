DRESOVI EURO – STABILNA VERZIJA ZA GITHUB PAGES I SVOJ DOMEN

Ova verzija više ne koristi GitHub API za učitavanje slika.
Radi preko fajla manifest.json, zato radi:
- lokalno
- na GitHub Pages
- na custom domenu

KAKO RADI:
1. Ubaciš slike u odgovarajući folder tima.
2. Pokreneš jednu komandu:
   ./publish.sh "dodate slike"
3. Skripta sama:
   - osveži manifest.json
   - uradi git add za catalog i manifest
   - uradi commit i push
4. Sajt prikazuje nove slike

NAJBITNIJE:
Kad dodaš nove slike, obavezno pokreni:
./publish.sh "dodate slike"

Ako hoćeš samo osvežavanje manifesta bez commita:
./refresh_manifest.sh

PRIMER:
Ako ubaciš slike u:
catalog/la-liga/real-madrid

onda pokreneš:
./publish.sh "real madrid nove slike"

i sajt će prikazati te slike i lokalno i live.

LOCAL PREVIEW:
python3 -m http.server 8000

pa otvori:
http://localhost:8000

KLIK NA SLIKU:
Klik na sliku otvara uvećanu verziju.

CUSTOM DOMEN:
Možeš normalno da dodaš svoj domen, jer ova verzija ne zavisi od github.io linka.