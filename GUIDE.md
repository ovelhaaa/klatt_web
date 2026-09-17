# Klatt Voice Synthesizer - Guia Completo

## 🎵 Visão Geral

O Klatt Voice Synthesizer é uma implementação web do modelo de síntese formante em cascata/paralelo de Dennis Klatt (1980), originalmente desenvolvido para o STM32. Esta versão web utiliza Web Audio API para processamento de áudio em tempo real a 48kHz.

## 🎛️ Modos de Operação

### 1. Poly Synth (Sintetizador Polifônico)
- 16 vozes simultâneas
- Cada voz tem envelope ADSR independente
- Filtros formantes aplicados ao som
- Ideal para tocar acordes e melodias
- Controles: Volume, Wave Shape, Flutter, ADSR, Resonators

### 2. Formant Synth (Sintetizador de Formantes)
- Síntese de fala baseada em consoantes e vogais
- 14 consoantes: K, S, R, T, W, M, Y, N, G, Z, B, D, P, H
- 7 vogais: A (ah), E (eh), I (ee), O (oh), U (oo), AI (eye), EI (ay)
- Transições temporais realistas entre fonemas
- Monitor de formants em tempo real

## 🎹 Controles

### Master
- **Volume**: Volume master do sintetizador
- **Wave Shape**: Distorção da forma de onda (0 = limpo, 100 = distorcido)
- **Flutter**: Variação natural da frequência (vibrato sutil)

### Envelope (ADSR)
- **Attack**: Tempo de ataque (0.01s - 1.1s)
- **Sustain**: Nível de sustentação (0-100%)
- **Release**: Tempo de release (0.01s - 1.1s)

### Resonator
- **Freq**: Frequência do filtro ressonador (0-3000 Hz)
- **BW**: Largura de banda (1-5000 Hz)
- **Wet**: Mix do efeito (0-100%)

### Antiresonator
- **Freq**: Frequência do filtro antirressonador (0-3000 Hz)
- **BW**: Largura de banda (1-5000 Hz)
- **Wet**: Mix do efeito (0-100%)

## 🎼 Presets

O sintetizador inclui 12 presets organizados em 3 categorias:

### Speech (Fala)
- **Clear Vowel**: Som de vogal limpo
- **Breathy Voice**: Voz suave e respirada
- **Robotic**: Fala mecânica
- **Whisper**: Sussurro

### Synth (Sintetizador)
- **Warm Pad**: Pad suave e quente
- **Pluck**: Som percussivo curto
- **Organ**: Tom de órgão clássico
- **String Ensemble**: Ensemble de cordas rico

### Effect (Efeitos)
- **Resonant Sweep**: Efeito de varredura ressonante
- **Notch Filter**: Efeito de filtro notch
- **Distortion**: Distorção pesada
- **Tremolo**: Tremolo baseado em flutter

## 🔄 Sequenciador

O sequenciador permite criar padrões rítmicos de sílabas:

### Padrões Pré-definidos
- **Ba-Ba-Ba** (120 BPM)
- **Ma-Me-Mi** (100 BPM)
- **Da-Da-Da-Da** (140 BPM)
- **Ka-Go-Ka-Go** (110 BPM)
- **Sa-Sha-Ta** (90 BPM)
- **Ra-Ra-Ro-Ro** (130 BPM)
- **Wa-Ya-Wa-Ya** (100 BPM)
- **Ha-Ha-Ha** (160 BPM)

### Funcionalidades
- Visualização dos passos em tempo real
- Play/Stop com um clique
- Indicador visual do passo atual

## ⏺ Gravador

O gravador permite criar sequências personalizadas:

### Como Usar
1. Clique em **⏺ Record**
2. Toque sílabas no teclado ou piano virtual
3. O tempo entre as notas é capturado automaticamente
4. Clique em **⏹ Stop Rec** para finalizar
5. Visualize as sílabas gravadas
6. Clique em **▶ Play Rec** para reproduzir
7. Exporte como JSON ou importe sequências salvas

### Recursos
- Gravação em tempo real
- Visualização das sílabas gravadas
- Exportação para arquivo JSON
- Importação de sequências salvas
- Limpar gravação

## 🎹 Entrada

### Teclado do Computador
```
A W S E D F T G Y H U J K O L P
C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5 A5 C6 D6
```

### Piano Virtual
- Clique nas teclas do piano para tocar notas
- Teclas brancas e pretas funcionais
- 2 oitavas (C3 até B4)

### MIDI Controller
- Detecção automática de dispositivos MIDI
- Note On/Off para tocar notas
- Pitch Bend para modulação
- Control Change para parâmetros:
  - CC 1: Flutter
  - CC 16: Wave Shape
  - CC 18: Master Volume
  - CC 71: Resonator BW
  - CC 73: Antiresonator Wet
  - CC 74: Resonator Frequency
  - CC 76: Resonator Wet
  - CC 77: Antiresonator Frequency
  - CC 93: Antiresonator BW

## 📊 Visualização

### Waveform
- Visualização em tempo real da forma de onda
- Atualização a 60 FPS
- Efeito de brilho (glow)

### Spectrum
- Visualização das frequências dos formants
- Mostra F1, F2, F3, F4, F5
- Escala de 0-5000 Hz
- Cores diferentes para cada formant

### Formant Monitor
- **Frequencies**: F0-F5 em Hz
- **Bandwidths**: B1-B3 em Hz
- **Amplitudes**: AV, AVS, AF, AH, A0
- Barras coloridas com valores numéricos
- Atualização em tempo real (~6 Hz)

## 🎨 Interface

### Layout Responsivo
- Desktop: 3 colunas (controles, visualização, informações)
- Tablet: 2 colunas
- Mobile: 1 coluna

### Temas de Cor
- Verde: Controles principais
- Azul: Envelope
- Ciano: Resonator
- Laranja: Antiresonator
- Roxo: Modo Formant
- Amarelo: Wave Shape

## 🔧 Desenvolvimento

### Estrutura do Projeto
```
src/
├── klatt/
│   ├── KlattEngine.ts      # Motor de síntese principal
│   ├── types.ts             # Tipos e constantes
│   ├── phonemes.ts          # Parâmetros de fonemas
│   ├── mtof.ts              # Conversão MIDI para frequência
│   ├── presets.ts           # Presets do sintetizador
│   ├── sequencer.ts         # Sequenciador de sílabas
│   └── recorder.ts          # Gravador de sequências
├── App.tsx                  # Componente principal da UI
├── main.tsx                 # Ponto de entrada
└── index.css                # Estilos globais
```

### Tecnologias
- React 18
- TypeScript
- Tailwind CSS
- Web Audio API
- Vite

### Build
```bash
npm install
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
```

## 📚 Referências

- [Klatt, D. H. (1980). Software for a cascade/parallel formant synthesizer. JASA, 67(4), 971-995.](http://www.fon.hum.uva.nl/david/ma_ssp/doc/Klatt-1980-JAS000971.pdf)
- [Klatt-Synth-STM](https://github.com/Origamijr/Klatt-Synth-STM) - Implementação original para STM32
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 🐛 Solução de Problemas

### Áudio não funciona
- Clique em "Start Synthesizer" para inicializar o AudioContext
- Verifique se o navegador suporta Web Audio API
- Tente recarregar a página

### MIDI não detectado
- Verifique se o dispositivo MIDI está conectado
- Recarregue a página com o dispositivo conectado
- Verifique as permissões do navegador

### Performance lenta
- Feche outras abas que usem áudio
- Reduza a taxa de atualização do navegador
- Use um navegador moderno (Chrome, Firefox, Edge)

## 📝 Notas Técnicas

### Processamento de Áudio
- Sample rate: 48kHz
- Buffer size: 2048 samples
- Latência: ~42ms
- Processamento em tempo real

### Modelo de Klatt
- Fonte glotal: Onda pulse com waveshaping
- Fonte de ruído: Gerador pseudo-aleatório
- Trilha em cascata: 5 ressonadores + 1 antirressonador
- Trilha paralela: 5 filtros ressonadores
- Total: 16 filtros (ressonadores + antirressonadores)

### Otimizações
- Tabelas de lookup para seno e MIDI
- Interpolação linear suave
- Buffers reutilizados (expfFast)
- Throttling de updates de UI

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Melhorar a documentação
- Otimizar o código

## 📄 Licença

Este projeto é uma implementação educacional baseada no modelo de Klatt.

---

**Desenvolvido com ❤️ usando React, TypeScript e Web Audio API**
