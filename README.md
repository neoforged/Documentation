# NeoForged 문서

마인크래프트 모드 개발 API NeoForge 및 Gradle 플러그인 NeoGradle의 비공식 한국어 번역본입니다.

문서는 [Docusaurus 3](https://docusaurus.io)로 빌드하고 [Github Pages](https://pages.github.com/)에 배포합니다.

## 기여하기

문서에 기여하고 싶으시다면 [가이드라인]을 참고하세요(https://docs.neoforged.net/contributing/). 공식 문서와 같은 규정을 따릅니다.

먼저 해당 리포지토리를 포크하고 클론해 주세요.

이 문서는 Node.js 18을 사용합니다. 해당 버전의 Node.js를 직접 설치하시거나, 아니면 `.node-version` 또는 `.nvmrc`를 지원하는 버전 관리자를 사용하세요. 대부분의 버전 관리자는 `install`, 또는 `use`를 통해 알맞은 Node.js 버전을 설치할 수 있습니다.

예를 들어:

```
nvm install # 또는 'nvs use'
```

아래 명령을 실행해 문서 미리보기를 실행할 수 있습니다. 모든 변경 사항은 재시작 필요 없이 바로 적용됩니다.

```bash
npm install
npm run start
```

### 웹사이트 빌드하기

해당 문서를 빌드해 어딘가 배포하시고 싶으시다면 아래 명령어를 사용하실 수 있습니다:

```bash
npm run build
```

위는 `build` 디렉토리에 정적 사이트를 생성해 아무 정적 사이트 호스팅 서비스를 사용하셔도 됩니다.
