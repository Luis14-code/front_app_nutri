# Instruções Detalhadas para Ativar a Inteligência Artificial (Gemini)

Seu projeto `nutri_app` está agora organizado de forma profissional e pronto para a integração da API Gemini. As funções de IA foram isoladas no arquivo `src/utils/gemini.js` e estão atualmente **simuladas (mockadas)** para permitir que você desenvolva o restante do aplicativo sem a necessidade de uma chave de API ativa.

Para ativar a funcionalidade completa da Inteligência Artificial, siga os passos abaixo:

## Passo 1: Obter sua Chave de API do Gemini

1.  **Acesse o Google AI Studio:** Navegue até o [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key).
2.  **Crie a Chave:** Clique em **"Create API key"** (Criar chave de API).
3.  **Copie a Chave:** Copie a chave gerada. **Guarde-a em um local seguro**, pois ela será usada para autenticar suas chamadas à API.

## Passo 2: Configurar a Chave de API no Código

Você deve configurar a chave de API no arquivo `src/utils/gemini.js`.

1.  **Abra o arquivo:** `nutri_app/src/utils/gemini.js`
2.  **Localize a variável `apiKey`:** No início do arquivo, você encontrará a linha:
    ```javascript
    // const apiKey = ""; // Injetada pelo ambiente
    ```
3.  **Insira sua Chave:** Descomente a linha e insira sua chave de API no lugar das aspas vazias.

    **Exemplo:**
    ```javascript
    const apiKey = "SUA_CHAVE_DE_API_AQUI"; // Substitua pela sua chave real
    ```

## Passo 3: Descomentar e Ativar as Funções de IA

No mesmo arquivo (`src/utils/gemini.js`), você encontrará três funções de IA. Para cada uma delas, você precisará remover o código de simulação (mock) e descomentar o código original que faz a chamada real à API.

### 1. `generateAIResponse` (Para o Chat Nutri Assistant)

Esta função é o seu **Nutri Assistant IA**. Ela usa o contexto do usuário (nome, metas, restrições) e o banco de receitas para fornecer respostas personalizadas, adaptar receitas e sugerir imagens.

*   **O que fazer:**
    1.  Localize a função `generateAIResponse`.
    2.  **Remova ou comente** o bloco de código de simulação (mock):
        ```javascript
        // Simulação de resposta da IA para evitar erros de API Key no desenvolvimento
        console.log("Simulando resposta da IA...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return "Olá! Sou seu Nutri Assistant IA. O código de integração com o Gemini está aqui, mas está mockado. Para ativá-lo, remova o 'return' da simulação e configure a 'apiKey' com sua chave real.";
        ```
    3.  **Descomente** o bloco de código logo abaixo, que começa com `/* // CÓDIGO ORIGINAL DO USUÁRIO (PARA ATIVAÇÃO)`.

### 2. `analyzeFoodText` (Para o Registro Inteligente)

Esta função é o seu **Registro Inteligente**. Ela recebe um texto livre (ex: "Comi 1 maçã e 30g de nozes") e usa o Gemini para analisar e retornar um objeto JSON estruturado com o nome da refeição, calorias, proteínas, carboidratos e gorduras.

*   **O que fazer:**
    1.  Localize a função `analyzeFoodText`.
    2.  **Remova ou comente** o bloco de código de simulação (mock).
    3.  **Descomente** o bloco de código logo abaixo, que começa com `/* // CÓDIGO ORIGINAL DO USUÁRIO (PARA ATIVAÇÃO)`.

### 3. `generateCreativeRecipe` (Para o Chef IA)

Esta função é o seu **Chef IA**. Ela recebe uma lista de ingredientes e usa o Gemini para criar uma receita saudável e criativa, retornando um objeto JSON com título, descrição, ingredientes, instruções e calorias estimadas.

*   **O que fazer:**
    1.  Localize a função `generateCreativeRecipe`.
    2.  **Remova ou comente** o bloco de código de simulação (mock).
    3.  **Descomente** o bloco de código logo abaixo, que começa com `/* // CÓDIGO ORIGINAL DO USUÁRIO (PARA ATIVAÇÃO)`.

## Resumo da Organização do Código

| Funcionalidade | Arquivo | Componente/Função |
| :--- | :--- | :--- |
| **Estrutura Principal** | `src/App.jsx` | `App` |
| **Layout/Navegação** | `src/components/AppLayout.jsx` | `AppLayout` |
| **Página Perfil/Metas** | `src/pages/Profile.jsx` | `Profile` e `AdherenceCalendar` |
| **Página Meu Dia** | `src/pages/StudentDashboard.jsx` | `StudentDashboard` |
| **Página Receitas** | `src/pages/RecipesFeed.jsx` | `RecipesFeed` |
| **Página Chat IA** | `src/pages/ChatPage.jsx` | `ChatPage` |
| **Funções de IA** | `src/utils/gemini.js` | `generateAIResponse`, `analyzeFoodText`, `generateCreativeRecipe` |
| **Componentes UI** | `src/components/ui/*.jsx` | `Button`, `Card`, `Input`, `Modal`, `ProgressBar` |

O código está agora organizado de forma profissional, com o CSS (Tailwind CSS) aplicado e as funcionalidades de perfil, metas e calendário de dieta (simulada) implementadas.

Se precisar de ajuda para rodar o projeto localmente ou tiver qualquer outra dúvida, estou à disposição!
