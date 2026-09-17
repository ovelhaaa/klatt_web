# Klatt Voice Synthesizer

Sintetizador de voz baseado no modelo de filtro em cascata/paralelo de Dennis Klatt (1980), implementado para web usando Web Audio API.

## 🎵 Características

- **Modelo de Klatt**: Implementação fiel do modelo de síntese formante com 16 ressonadores/antiressonadores
- **Dois Modos**:
  - **Poly Synth**: Sintetizador polifônico de 16 vozes com filtros formantes
  - **Formant Synth**: Síntese de fala com combinações consoante-vogal
- **14 Consoantes**: K, S, R, T, W, M, Y, N, G, Z, B, D, P, H
- **7 Vogais**: A (ah), E (eh), I (ee), O (oh), U (oo), AI (eye), EI (ay)
- **Controles em Tempo Real**: Volume, wave shape, flutter, envelope ADSR, ressonadores
- **Visualização**: Waveform em tempo real e monitor de formantes
- **Entrada**: Teclado do computador, piano virtual, MIDI controller
- **Processamento**: 48kHz via Web Audio API

## 🚀 Deploy via GitHub Actions

### Configuração Automática

O projeto já está configurado com GitHub Actions para deploy automático no GitHub Pages.

#### Passos para Deploy:

1. **Fork ou Clone este repositório**
   ```bash
   git clone https://github.com/seu-usuario/klatt-synth-web.git
   cd klatt-synth-web
   ```

2. **Configure o GitHub Pages**
   - Vá para **Settings** → **Pages** no seu repositório
   - Em **Source**, selecione **GitHub Actions**
   - O workflow será executado automaticamente em cada push para `main` ou `master`

3. **Acesse o site**
   - Após o deploy, seu site estará disponível em:
   - `https://seu-usuario.github.io/nome-do-repositorio/`

### Workflow Details

O workflow (`.github/workflows/deploy.yml`) faz o seguinte:

```yaml
1. Checkout do código
2. Setup do Node.js 20
3. Instalação de dependências (npm ci)
4. Build do projeto (npm run build)
5. Upload do artifact para GitHub Pages
6. Deploy automático
```

### Variáveis de Ambiente

O workflow configura automaticamente:
- `GITHUB_PAGES=true`: Habilita o base path correto para GitHub Pages
- `GITHUB_REPOSITORY`: Usado para calcular o base path dinamicamente

### Deploy Manual

Para fazer deploy manual:

```bash
# Build local
npm install
npm run build

# O build estará em ./dist
# Faça upload manual ou use GitHub CLI
gh workflow run deploy.yml
```

## 🎹 Uso

### Teclado do Computador

Use as teclas para tocar notas (C4 até C6):
```
A W S E D F T G Y H U J K
C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5
```

### Piano Virtual

Clique nas teclas do piano na interface para tocar notas.

### MIDI Controller

Conecte um controlador MIDI via USB. O sintetizador detecta automaticamente:
- **Note On/Off**: Tocar notas
- **Pitch Bend**: Modulação de pitch
- **Control Change**: Controlar parâmetros (veja tabela abaixo)

### Controles MIDI

| CC # | Função |
|------|--------|
| 1 | Flutter Depth |
| 18 | Master Volume |
| 16 | Wave Shape |
| 74 | Resonator Frequency |
| 71 | Resonator Bandwidth |
| 76 | Resonator Wet |
| 77 | Antiresonator Frequency |
| 93 | Antiresonator Bandwidth |
| 73 | Antiresonator Wet |

### Modo Formant Synth

1. Selecione uma consoante (ou ∅ para nenhuma)
2. Selecione uma vogal
3. Toque uma nota ou clique em "Speak"
4. Ou use os presets de sílabas pré-definidas

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📚 Referências

- [Klatt, D. H. (1980). Software for a cascade/parallel formant synthesizer. JASA, 67(4), 971-995.](http://www.fon.hum.uva.nl/david/ma_ssp/doc/Klatt-1980-JAS000971.pdf)
- [Klatt-Synth-STM](https://github.com/Origamijr/Klatt-Synth-STM) - Implementação original para STM32
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 📄 Licença

Este projeto é uma implementação educacional baseada no modelo de Klatt.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

**Nota**: Este sintetizador funciona melhor em navegadores modernos (Chrome, Firefox, Safari, Edge) com suporte completo ao Web Audio API.
