## Especificação completa do Document Management System

Baseada no template em `spec-template.md`, a especificação abaixo foi adaptada ao projeto e ao escopo real do backend e frontend.

---

## 1. Objetivo

Desenvolver um sistema web para upload, listagem e download de documentos, com armazenamento local e metadados simples em memória, de forma modular e alinhada à arquitetura em camadas do backend.

## 2. Escopo

### Dentro do escopo

- Upload de documentos
- Listagem de documentos enviados
- Download de um documento por identificador
- Acesso via API REST do backend
- Interface web simples para interação do usuário
- Persistência local dos arquivos no filesystem da aplicação
- Gestão básica por proprietário do documento

### Fora do escopo

- Armazenamento externo ou em nuvem
- Autenticação e autorização avançada
- Versionamento de arquivos
- Compartilhamento de documentos em múltiplos usuários
- Busca textual por conteúdo do documento
- Criptografia de arquivos em repouso
- Integração com serviços de terceiros

## 3. Requisitos funcionais

| ID | Requisito | Descrição |
| --- | --- | --- |
| RF-01 | O usuário pode enviar um documento | O sistema deve aceitar um arquivo em multipart/form-data e registrar os metadados do documento |
| RF-02 | O usuário pode listar os documentos enviados | O sistema deve retornar uma lista com os metadados de todos os documentos existentes |
| RF-03 | O usuário pode baixar um documento pelo identificador | O sistema deve localizar o arquivo pelo id e devolver o conteúdo binário para download |
| RF-04 | O sistema deve registrar o nome original do arquivo | O nome original deve ser preservado e retornado em respostas e na interface |
| RF-05 | O sistema deve identificar a data do upload | Cada documento deve conter uma marca temporal de criação em ISO 8601 |
| RF-06 | O sistema deve identificar o dono do documento | O metadado owner deve indicar o usuário responsável por aquele arquivo |

## 4. Requisitos não funcionais

| ID | Requisito | Descrição |
| --- | --- | --- |
| RNF-01 | Armazenamento local | Os arquivos devem ser gravados no filesystem local da aplicação, em backend/storage, usando multer com diskStorage |
| RNF-02 | Metadados em memória | Os dados do documento devem ser mantidos em memória durante esta fase do projeto |
| RNF-03 | Configuração por ambiente | A aplicação deve usar variáveis de ambiente para configuração básica, seguindo princípios 12-Factor |
| RNF-04 | Simplicidade de manutenção | A estrutura deve seguir Clean Architecture simples: routes, controllers, services, repositories |
| RNF-05 | Compatibilidade com Node.js | O backend deve funcionar com Node.js e Express, sem depender de frameworks externos para persistência |
| RNF-06 | Frontend leve | O frontend deve usar React + Vite e consumir a API por fetch com prefixo /api |

## 5. Modelo de dados

| Campo | Tipo | Descrição |
| --- | --- | --- |
| id | string | Identificador único do documento |
| originalName | string | Nome original do arquivo enviado |
| size | number | Tamanho em bytes do arquivo |
| uploadedAt | string | Data e hora do upload em formato ISO 8601 |
| owner | string | Identificador do usuário dono do documento |
| storagePath | string | Caminho local do arquivo no filesystem da aplicação |

> Observação: o campo storagePath é recomendado para apoiar a lógica de download e rastreio do arquivo no disco local, mesmo que o contrato final da API possa expor apenas os metadados principais.

## 6. Contratos de API

### 6.1 POST /upload

- Método: POST
- Content-Type: multipart/form-data
- Entrada: arquivo enviado pelo cliente
- Parâmetros:
  - file: arquivo a ser enviado
  - owner: identificador do usuário responsável, quando aplicável no frontend ou no payload da requisição
- Resposta esperada em caso de sucesso:
  - 201 Created
  - JSON com os metadados do documento criado

Exemplo de resposta:

{
  "id": "doc_123",
  "originalName": "relatorio.pdf",
  "size": 245678,
  "uploadedAt": "2026-09-29T12:30:00.000Z",
  "owner": "usuario-01",
  "storagePath": "/app/backend/storage/doc_123_relatorio.pdf"
}

Possíveis erros:
- 400 Bad Request: arquivo ausente ou inválido
- 500 Internal Server Error: falha ao gravar o arquivo ou gerar metadados

### 6.2 GET /documents

- Método: GET
- Resposta esperada em caso de sucesso:
  - 200 OK
  - array de objetos contendo metadados dos documentos

Exemplo de resposta:

[
  {
    "id": "doc_123",
    "originalName": "relatorio.pdf",
    "size": 245678,
    "uploadedAt": "2026-09-29T12:30:00.000Z",
    "owner": "usuario-01"
  }
]

Possíveis erros:
- 500 Internal Server Error: falha ao consultar a coleção de metadados

### 6.3 GET /documents/:id/download

- Método: GET
- Parâmetro de rota:
  - id: identificador do documento
- Resposta esperada em caso de sucesso:
  - 200 OK
  - conteúdo binário do arquivo
  - cabeçalho Content-Type apropriado
  - nome do arquivo original para download

Possíveis erros:
- 404 Not Found: documento inexistente
- 500 Internal Server Error: falha na leitura do arquivo

## 7. Decisões arquiteturais

- O backend será organizado em camadas:
  - routes: definição das rotas HTTP
  - controllers: entrada/saída HTTP e validação básica
  - services: regras de negócio
  - repositories: persistência, armazenamento local e acesso aos metadados
- O fluxo de dependência deve seguir:
  - routes → controllers → services → repositories
- O armazenamento físico dos arquivos será local, no diretório backend/storage, respeitando a restrição do projeto.
- Os metadados serão mantidos em memória, em uma estrutura simples de dados, por exemplo:
  - array ou mapa keyed por id
- O frontend será funcional, com componentes reusáveis, e se comunicará com o backend via fetch com prefixo /api.
- A aplicação deve ser simples, legível e evolutiva, priorizando clareza e manutenção em vez de abstrações excessivas.
- A autenticação não será implementada nesta fase; o owner será tratado como um identificador simples do usuário no metadado.

## 8. Plano de execução

### Etapa 1 — Estrutura inicial do backend e configuração de ambiente
- Objetivo: preparar a base do backend para os endpoints e dependências necessárias.
- Arquivos a serem criados ou alterados:
  - `app.js`
  - `package.json`
  - backend/src/routes/
  - backend/src/controllers/
  - backend/src/services/
  - backend/src/repositories/
  - backend/storage/
- Decisões:
  - utilizar Express e multer
  - configurar upload local com diskStorage
  - configurar porta por variável de ambiente
- Riscos:
  - configuração incorreta do multer
  - falha no acesso ao diretório de armazenamento
- Critérios de aceite:
  - backend subindo sem erro
  - rota /health funcionando
  - diretório backend/storage existente

### Etapa 2 — Implementação do fluxo de upload
- Objetivo: permitir envio de documentos e registro de metadados.
- Arquivos a serem criados ou alterados:
  - backend/src/routes/documentRoutes.js
  - backend/src/controllers/uploadController.js
  - backend/src/services/uploadService.js
  - backend/src/repositories/documentRepository.js
- Decisões:
  - usar multer para persistir o arquivo em disco
  - gerar id único para cada documento
  - preservar originalName, size, uploadedAt e owner
- Riscos:
  - sobrescrita de arquivos com nomes repetidos
  - perda de metadados em caso de erro de persistência
- Critérios de aceite:
  - upload com arquivo válido retorna 201
  - arquivo é salvo em backend/storage
  - metadados são retornados em JSON
  - upload sem arquivo retorna erro de validação

### Etapa 3 — Listagem de documentos
- Objetivo: expor todos os documentos cadastrados.
- Arquivos a serem criados ou alterados:
  - backend/src/routes/documentRoutes.js
  - backend/src/controllers/documentController.js
  - backend/src/services/documentService.js
- Decisões:
  - listar os metadados em memória sem expor caminho físico completo se não for necessário
  - manter resposta simples e legível
- Riscos:
  - retorno inconsistente de dados
  - vazamento de informações sensíveis
- Critérios de aceite:
  - GET /documents retorna 200
  - lista contém os documentos existentes
  - resposta segue o modelo definido

### Etapa 4 — Download de documento
- Objetivo: permitir recuperar o arquivo enviado por id.
- Arquivos a serem criados ou alterados:
  - backend/src/routes/documentRoutes.js
  - backend/src/controllers/downloadController.js
  - backend/src/services/downloadService.js
  - backend/src/repositories/documentRepository.js
- Decisões:
  - localizar o arquivo via id e caminho local
  - devolver o stream do arquivo com cabeçalho correto
- Riscos:
  - arquivo inexistente ou removido fisicamente
  - falha de leitura ao tentar baixar
- Critérios de aceite:
  - GET /documents/:id/download retorna 200
  - conteúdo é o mesmo arquivo enviado
  - id inexistente retorna 404

### Etapa 5 — Integração com o frontend
- Objetivo: permitir que o usuário interaja com o sistema pela interface web.
- Arquivos a serem criados ou alterados:
  - `App.jsx`
  - frontend/src/components/
  - frontend/src/pages/
  - frontend/src/services/
  - `vite.config.js`
- Decisões:
  - consumir a API via fetch
  - separar componentes de upload, listagem e download
  - usar /api como prefixo para evitar conflitos com o backend local
- Riscos:
  - incompatibilidade de rotas entre Vite e Express
  - erros de CORS ou proxy
- Critérios de aceite:
  - usuário consegue enviar um arquivo
  - lista apresenta os documentos
  - botão de download funciona
  - interface responde aos erros do backend

### Etapa 6 — Validação e ajustes de robustez
- Objetivo: garantir a estabilidade da aplicação em cenários básicos.
- Arquivos a serem criados ou alterados:
  - `app.test.js`
  - ajustes finais em `app.js` e rotas
- Decisões:
  - escrever testes focados em comportamento real
  - validar cenários de sucesso e falha
- Riscos:
  - testes fracos ou mockados demais
  - regressão em endpoints já existentes
- Critérios de aceite:
  - testes cobrindo upload, listagem e download
  - fluxo principal funcionando de ponta a ponta
  - ausência de falhas críticas em execução local

### Etapa 7 — Hardening e documentação final
- Objetivo: preparar a aplicação para uso e facilitar manutenção.
- Arquivos a serem criados ou alterados:
  - `README.md`
  - docs/specs/
  - comentários e mensagens em português
- Decisões:
  - manter mensagens para o usuário em português
  - registrar regras de uso local de armazenamento
  - documentar limitações da fase inicial
- Riscos:
  - ausência de documentação
  - confusão sobre armazenamento em memória e local
- Critérios de aceite:
  - README explicando como executar o projeto
  - especificação e arquitetura bem documentadas
  - limitação de escopo clara

---

## Resumo executivo

O Document Management System deve permitir que um usuário envie arquivos, visualize os documentos cadastrados e baixe qualquer arquivo por identificador. O backend deve seguir a arquitetura em camadas proposta, com arquivos armazenados localmente e metadados em memória, enquanto o frontend deve consumir a API com uma interface simples e funcional.

Se quiser, posso transformar essa especificação em uma versão pronta para colar diretamente no arquivo `spec-template.md` em formato final de documentação.