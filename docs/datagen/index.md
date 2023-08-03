데이터 생성기
===============

데이터 생성기는 코드를 사용해 모드에 필요한 에셋과 데이터를 만드는 방법입니다. 이를 통해 에셋과 데이터들을 코드에서 정의하고 문법이나 규격에 상관없이 편하게 생성할 수 있도록 해줍니다.

데이터 생성 시스템은 메인 클래스 `net.minecraft.data.Main` 에서 불러옵니다. 게임 실행 명령 인수를 바꿔 어떤 모드의 데이터를 수집할지, 어떤 파일들을 고려할지 등을 설정하실 수 있습니다. 데이터 생성을 관리하는 클래스는 `net.minecraft.data.DataGenerator` 입니다.

MDK의 `build.gradle`은 기본적으로 `runData` 실행 구성을 추가하여 데이터 생성기를 실행할 수 있도록 해줍니다.

외부 에셋 참조하기
--------------

데이터 생성기는 `ExistingFileHelper`를 사용해 참조된 외부 에셋들이 누락되지 않았는지 확인합니다. 이 클래스의 인스턴스는 `GatherDataEvent#getExistingFileHelper`로 받을 수 있습니다. 아래 명령 인수로 참조할 에셋들을 지정할 수 있습니다.

명령 인수 `--existing <리소스 폴더 경로>`로 외부 리소스의 경로를 지정해 데이터 생성기에서 참조하실 수 있습니다. 지정된 경로는 하위 폴더까지 다 포함합니다. 추가적으로, 명령 인수 `--existing-mod <모드 아이디>`는 데이터 생성기가 외부 모드의 리소스들을 사용할 수 있도록 합니다. 이러한 인수들을 지정하지 않았다면 오직 마인크래프트 기본 데이터팩과 리소스팩만이 `ExistingFileHelper` 에 등록됩니다.

생성 모드
---------------

데이터 생성기는 명령 인수에 따라 네 가지 종류의 데이터를 생성할 수 있습니다, 이후 `GatherDataEvent#include***` 메서드들로 무슨 데이터가 생성될지 확인하실 수 있습니다.

* __클라이언트 에셋__
  * `asset`의 클라이언트 전용 파일 생성: 블록/아이템 모델, BlockState 정의 JSON 파일들, 언어 파일 등.
  * __`--client`__ 인수가 있어야 실행됨, `#includeClient`로 확인 가능
* __서버 데이터__
  * `data`의 서버 전용 데이터를 생성합니다: 조합법, 발전과제, 태그 등.
  * __`--server`__ 인수가 있어야 실행됨, `#includeServer`로 확인 가능
* __개발 도구__
  * 개발 도구 실행: SNBT를 NBT 로 바꾸기, 그 반대로 바꾸기 등.
  * __`--dev`__ 인수가 있어야 실행됨, `#includeDev`로 확인 가능
* __보고서 작성__
  * 블록, 아이템, 명령어등 등록된 항목들 덤프.
  * __`--reports`__ 인수가 있어야 실행됨, `#includeReports`로 확인 가능

모든 종류의 데이터를 생성하려면 `-all`을 사용하세요.

`DataProvider`
--------------

`DataProvider`는 무슨 데이터를 어떻게 생성할지 정의하는 클래스 입니다. 이 클래스를 상속하는 것으로 생성할 데이터를 정의할 수 있습니다. 마인크래프트는 이미 `DataProvider`를 일부 구현하는 태그, 모델 생성 등에 특화된 몇가지의 하위 클래스들을 제공하기에 메서드 몇개만 구현하시면 됩니다.
`GatherDataEvent` 는 데이터 생성기가 초기화 될 때 모드 버스에 방송됩니다, `DataGenerator`를 `GatherDataEvent#getGenerator`로 접근하신 이후 `DataGenerator#addProvider`를 사용해 `DataProvider`를 등록하세요.

### 클라이언트 에셋

* [`net.minecraftforge.common.data.LanguageProvider`][langgen] - [언어 파일 생성용][lang]; `#addTranslations` 구현
* [`net.minecraftforge.common.data.SoundDefinitionsProvider`][soundgen] - [`sounds.json` 생성용][sounds]; `#registerSounds` 구현
* [`net.minecraftforge.client.model.generators.ModelProvider<?>`][modelgen] - [모델 생성용][models]; `#registerModels` 구현
  * [`ItemModelProvider`][itemmodelgen] - 아이템 모델 생성용
  * [`BlockModelProvider`][blockmodelgen] - 블록 모델 생성용
* [`net.minecraftforge.client.model.generators.BlockStateProvider`][blockstategen] - 블록 상태, 블록 모델, 아이템 모델 생성용; `#registerStatesAndModels` 구현

### 서버 데이터

**아래 항목은 `net.minecraftforge.common.data` 패키지에 있음**:

* [`GlobalLootModifierProvider`][glmgen] - [노획물 수정 파일 생성용][glm]; `#start` 구현
* [`DatapackBuiltinEntriesProvider`][datapackregistriesgen] - 데이터 팩 레지스트리 객체 생성용; 생성자에 `RegistrySetBuilder` 전달

**아래 항목은 `net.minecraft.data` 패키지에 있음**:

* [`loot.LootTableProvider`][loottablegen] - [노획물 목록 생성용][loottable]; 생성자에 `LootTableProvider$SubProviderEntry` 전달
* [`recipes.RecipeProvider`][recipegen] - [조합법][recipes] 및 해금 발전과제 생성용; `#buildRecipes` 구현
* [`tags.TagsProvider`][taggen] - [태그 생성용][tags]; `#addTags` 구현
* [`advancements.AdvancementProvider`][advgen] - [발전과제 생성용][advancements]; 생성자에 `AdvancementSubProvider` 전달

[langgen]: ./client/localization.md
[lang]: https://minecraft.fandom.com/wiki/Language
[soundgen]: ./client/sounds.md
[sounds]: https://minecraft.fandom.com/wiki/Sounds.json
[modelgen]: ./client/modelproviders.md
[models]: ../resources/client/models/index.md
[itemmodelgen]: ./client/modelproviders.md#itemmodelprovider
[blockmodelgen]: ./client/modelproviders.md#blockmodelprovider
[blockstategen]: ./client/modelproviders.md#block-state-provider
[glmgen]: ./server/glm.md
[glm]: ../resources/server/glm.md
[datapackregistriesgen]: ./server/datapackregistries.md
[loottablegen]: ./server/loottables.md
[loottable]: ../resources/server/loottables.md
[recipegen]: ./server/recipes.md
[recipes]: ../resources/server/recipes/index.md
[taggen]: ./server/tags.md
[tags]: ../resources/server/tags.md
[advgen]: ./server/advancements.md
[advancements]: ../resources/server/advancements.md
