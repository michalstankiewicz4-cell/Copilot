# Copilot - Gra z Systemem Wyceny

Interaktywna gra z dynamicznym systemem wyceny w czasie rzeczywistym.

## Funkcje

### Sterowanie
- **Strzałki klawiatury**: ← → ↑ ↓ (lub WASD)
- **Mysz**: Kropka płynnie podąża za kursorem

### Panel Sterowania (Lewy)
- Timer czasu tworzenia gry
- Checkboxy do włączania/wyłączania funkcji w locie:
  - Sterowanie strzałkami
  - Sterowanie myszką
  - Grafika HD (siatka, efekty świetlne)
  - Animacje płynne (60 FPS)
  - System dźwięków
  - Efekty cząsteczkowe (ślad za kropką)
- Przycisk RESTART do resetowania pozycji

### Gra (Środek)
- Czarna plansza z siatką (gdy Grafika HD włączona)
- Zielona kropka z efektem świecenia
- Efekty cząsteczkowe podczas ruchu
- Wyświetlanie pozycji i dostępnego sterowania

### Panel Wyceny (Prawy)
- Lista wszystkich modułów z cenami
- Status aktywny/nieaktywny (✓/✗)
- Zajętość pamięci każdego modułu
- **Podsumowanie:**
  - Koszt modułów kodu
  - Pamięć zajęta (KB)
  - Czas pracy (150 PLN/h)
  - Suma całkowita

## Moduły i Ceny

| Moduł | Cena | Pamięć | Wymagany |
|-------|------|--------|----------|
| Sterowanie strzałkami | 500 PLN | 2 KB | Nie |
| Sterowanie myszką | 400 PLN | 1.5 KB | Nie |
| Grafika HD | 1500 PLN | 8 KB | Nie |
| Animacje płynne | 800 PLN | 3 KB | Nie |
| System dźwięków | 600 PLN | 2.5 KB | Nie |
| Efekty cząsteczkowe | 1200 PLN | 4 KB | Nie |
| Silnik gry (core) | 2000 PLN | 10 KB | **TAK** |
| System renderowania | 1000 PLN | 5 KB | **TAK** |
| Fizyka ruchu | 700 PLN | 3.5 KB | **TAK** |

## Uruchomienie

1. Otwórz `game.html` w przeglądarce
2. Gra startuje automatycznie
3. Timer zaczyna liczyć od momentu załadowania
4. Wyłączaj/włączaj funkcje aby zobaczyć zmiany w cenie

## Technologia

- **HTML5 Canvas** - renderowanie grafiki
- **JavaScript (ES6+)** - logika gry
- **CSS3 Grid** - układ interfejsu
- Brak zależności zewnętrznych
- Działa bez serwera (tylko przeglądarka)

## Struktura Plików

```
Copilot/
├── game.html       # Główny plik HTML z interfejsem
├── game.js         # Logika gry i system wyceny
└── README.md       # Ten plik
```

## Autorzy

Projekt Copilot - System wyceny gier

## Licencja

MIT License
