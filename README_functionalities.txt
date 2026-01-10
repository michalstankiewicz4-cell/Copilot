Wersja: 1.0
Plik: README_functionalities.txt

Opis funkcjonalności programu (polski):
- Program rysuje interaktywną scenę 3D z kołami zębatymi (three.js).
- Na start są 3 koła różnej wielkości (różne liczby zębów).
- Każde koło ma:
  - wizualne zęby (prostopadłościany rozmieszczone dookoła),
  - kropkę na obwodzie pokazującą obrót,
  - niewidzialną geometrię pomocniczą do raycastingu (wykrywania kliknięć).
- Fizyczne powiązanie:
  - Koła, które stykają się (odległość ≈ suma promieni) są powiązane jako sąsiedzi.
  - Obrót jednego koła (PPM i przeciągnięcie) powoduje kinematyczne obrócenie wszystkich sąsiednich kół zgodnie z przełożeniem wynikającym z liczby zębów:
    kąt_sąsiada = - kąt_źródłowy * (zęby_źródła / zęby_sąsiada)
  - Propagacja wykonywana jest BFS po grafie sąsiedztwa.
- Sterowanie:
  - Scroll — zoom kamery (przybliżanie/oddalanie).
  - LPM (przytrzymaj i przeciągnij) — przesuwanie sceny (scenaGroup jest przesuwana), dzięki temu kamera pozostaje wycentrowana względem świata (kamera patrzy na stały punkt), ale widoczność sceny możesz przesuwać.
  - ŚPM (środkowy przycisk) — alternatywne przesuwanie sceny (działa jak LPM).
  - PPM (przytrzymaj prawy przycisk) nad kołem zębatym i przeciągnij — obracanie tego koła, reszta kół obraca się w wyniku powiązań.
  - Na kółkach jest widoczna kropka, która daje wizualną informację o obrocie.
- Interfejs:
  - Lewy pasek (sidebar) pokazuje statystyki: ile jest kół oraz dla każdego koła: liczba zębów, promień, aktualny kąt obrotu.
  - Informacja o sterowaniu również po lewej stronie.

Zasady projektowe:
- Nigdy nie kasujemy starych plików — nowe funkcjonalności dodajemy jako nowe pliki lub rozbudowujemy istniejące bez usuwania wcześniejszych.
- Nie wprowadzamy żadnych zmian w programie bez zgody (w kontekście wymagań użytkownika). Dotyczy to zarówno plików, jak i logiki.

Pliki projektu:
- index.html — punkt wejścia, kontener canvas i sidebar.
- styles/style.css — style dla aplikacji i panelu.
- src/gear.js — klasa Gear tworzy geometrię koła zębatego i udostępnia API (rotateBy, setRotation, getRadius, getMesh).
- src/ui.js — prosty panel statystyk.
- src/main.js — inicjacja sceny, kamery, renderer, tworzenie kół, wykrywanie zdarzeń użytkownika, logika propagacji obrotów, panning sceny i zoom.

Uruchomienie:
- Otwórz index.html w przeglądarce obsługującej moduły ES (np. najnowsze Chrome/Firefox).
- Nie jest wymagany serwer (ale z powodu modułów i polityk CORS lepiej uruchomić proste static server, np. `npx http-server` w katalogu projektu).

Możliwe rozszerzenia (do dodania w przyszłości):
- dokładniejsze modelowanie zębów (profil involutyczny),
- fizyczne symulacje (RBD) zamiast kinematycznego sprzężenia,
- dodawanie/usuńanie kół z interfejsu (bez kasowania starego kodu),
- zapis/ładowanie układów kół,
- przywracanie pozycji kamery (recenter) przyciskiem.

Koniec pliku.
