---
sidebar_position: 1
---
# 레지스트리

게임의 각 요소([아이템][item], [블록][block], 엔티티)들은 게임에 존재한다고 등록해야 제대로 작동합니다. 그렇지 않으면 게임은 새로 추가된 요소를 알지 못해 예기치 못한 동작을 하거나, 심하면 충돌할 수도 있습니다.

레지스트리는 위 요소들을 등록하는 곳입니다. 각 요소마다 저마다의 레지스트리가 있습니다; 아이템은 아이템 레지스트리가 있고, 블록은 블록 레지스트리가 있습니다. 레지스트리는 요소의 이름(아래 참고)을 등록된 객체로 대치시키는 일종의 맵이라고 볼 수 있습니다. 이름은 한 레지스트리 안에선 무조건 고유해야 하지만, 다른 레지스트리에선 같아도 됩니다. 대표적인 예로, 흙 블록과 흙 아이템은 둘 다 이름이 `minecraft:dirt` 입니다.

레지스트리에 등록되는 객체의 이름은 [`ResourceLocaiton`][resloc]으로 표현합니다. 예를 들어, 흙 블록의 레지스트리 이름은 `minecraft:dirt`이고, 좀비의 레지스트리 이름은 `minecraft:zombie` 입니다. 모드에서 추가한 요소는 당연히 `minecraft` 말고 다른 네임 스페이스를 사용해야 합니다; 대개 모드 아이디를 사용합니다.

## 바닐라 vs. 모드

네오 포지의 레지스트리 시스템을 이해하기 위해선 먼저 마인크래프트의 레지스트리를 살펴보아야 합니다. 블록 레지스트리를 예로 들겠지만, 다른 레지스트리들도 똑같이 동작합니다.

레지스트리는 [싱글턴][singleton] 패턴을 사용합니다, 다시 말해서 레지스트리에 등록되는 모든 요소는 오직 하나만 존재합니다. 다시 말해서 게임에서 여러번 등장하는 돌 블록은 사실 하나의 돌 블록이 여러번 표시된 것입니다. 돌 블록을 사용할 땐 이미 등록된 돌 블록을 재사용합니다.

마인크래프트의 모든 블록들은 `Blocks` 클래스에서 등록합니다. 내부적으로 `Registry#register()`를 호출해 각 블록들을 `BuiltInRegistries.BLOCK`에 등록하며, 이후 등록한 블록들이 올바른지, 다 모델은 가지고 있는지 등의 검사를 수행합니다. 

`Blocks` 클래스는 마인크래프트가 일찍 불러오기 때문에 문제 없이 동작하지만, 모드가 추가한 블록들은 그렇지 않아 다른 방법을 사용해야 합니다.

## 레지스트리에 등록하기

네오 포지는 객체를 등록하는 두 가지 방법을 제공합니다: `DeferredRegister`와 `RegistryEvent` 입니다. 이때 전자는 후자를 감싸는 유틸리티이며, 전자를 사용하는 것이 권장됩니다.

### `DeferredRegister`

`DeferredRegister`는 객체를 어디에, 어떻게 등록하는지 알려주면 알맞은 때에 자동으로 등록하는, 일종의 예약 시스템입니다. 먼저, `DeferredRegister`를 생성하세요:

```java
public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(
        // 첫번째 인자는 객체를 등록할 레지스트리
        // 마인크래프트 자체의 레지스트리는 BuiltInRegistries에서, 네오 포지가 추가한 레지스트리는 NeoForgeRegistries에서 찾을 수 있습니다.
        // 모드도 자체 레지스트리를 추가할 수 있습니다. 이 경우 모드의 소스코드나 문서를 참고하세요.
        BuiltInRegistries.BLOCKS,
        // 두번째 인자는 객체를 등록하는 모드의 아이디
        ExampleMod.MOD_ID
);
```

이후 아래와 같이 레지스트리 요소를 정적 상수로 정의하세요 (`new Block()`에 무슨 인자를 전달할 지는 [블록 문서][block]을 참고하세요):

```java
public static final DeferredHolder<Block, Block> EXAMPLE_BLOCK = BLOCKS.register(
        "example_block" // 블록의 레지스트리 이름
        () -> new Block(...) // 등록할 객체를 만드는 Supplier
);
```

`DeferredHolder<R, T extends R>`는 등록된 객체를 저장하는 클래스 입니다. 타입 인자 `R`은 레지스트리의 타입 (여기선 `Block`), `T`는 위 Supplier의 반환 타입입니다. 여기선 `Block`을 바로 만들고 등록하니 두 타입 인자 다 `Block`을 사용합니다. 만약 `SlabBlock`과 같은 자식 클래스를 대신 사용했다면 `T`는 `SlabBlock`을 대신 사용합니다.

`DeferredHolder<R, T extends R>`는 `Supplier<T>`의 하위 클래스 입니다. 나중에 등록된 객체를 사용하려면 `DeferredHolder#get()`을 사용하세요. `DeferredHolder`가 `Supplier`의 자식 클래스이니 아래처럼 `Supplier`를 대신 사용하셔도 됩니다:

```java
public static final Supplier<Block> EXAMPLE_BLOCK = BLOCKS.register(
        "example_block" // 블록의 레지스트리 이름
        () -> new Block(...) // 등록할 객체를 만드는 Supplier
);
```

이 시스템은 레지스트리 이벤트를 감싸는 유틸리티니, `DeferredRegister`에 이벤트가 방송되는 버스를 아래처럼 전달해야 합니다:

```java
// 모드 생성자
public ExampleMod(IEventBus modBus) {
    //highlight-next-line
    ExampleBlocksClass.BLOCKS.register(modBus);
    // 기타 등등
}
```

:::info
블록과 아이템에 특화된 `DeferredRegister`인 [`DeferredRegister.Blocks` (블록)][defregblocks], 그리고 [`DeferredRegister.Items` (아이템)][defregitems]도 있습니다.
:::

### `RegisterEvent`

`RegisterEvent`는 객체를 직접 등록할 때 사용합니다. 이 [이벤트][event]는 각 레지스트리마다 방송되며, 모드 진입점 실행 후와 모드 설정을 불러오기 전 사이에 모드 버스에 방송됩니다.

```java
@SubscribeEvent
public void register(RegisterEvent event) {
    event.register(
            // 등록할 레지스트리의 이름
            // 마인크래프트 기본 레지스트리의 이름은 BuiltInRegistries에서 참조 가능.
            // 네오 포지가 추가한 레지스트리의 이름은 NeoForgeRegistries.Keys에서 참조 가능.
            BuiltInRegistries.BLOCKS,
            // 여기서 객체를 등록하세요.
            registry -> {
                registry.register(new ResourceLocation(MODID, "example_block_1"), new Block(...));
                registry.register(new ResourceLocation(MODID, "example_block_2"), new Block(...));
                registry.register(new ResourceLocation(MODID, "example_block_3"), new Block(...));
            }
    );
}
```

## 레지스트리 조회하기

레지스트리는 `ResourceLocation`을 게임의 요소와 대응시키는 일종의 맵 자료구조니, 아래처럼 등록된 객체를 이름으로 조회하거나, 아니면 객체의 이름을 찾을 수 있습니다:

```java
BuiltInRegistries.BLOCKS.get(new ResourceLocation("minecraft", "dirt")); // 흙 블록 반환
BuiltInRegistries.BLOCKS.getKey(Blocks.DIRT); // 흙의 레지스트리 이름, "minecraft:dirt" 반환

// ExampleBlocksClass.EXAMPLE_BLOCK가 "yourmodid:example_block"를 이름으로 가지는 블록이라 가정
BuiltInRegistries.BLOCKS.get(new ResourceLocation("yourmodid", "example_block")); // example block 반환
BuiltInRegistries.BLOCKS.getKey(ExampleBlocksClass.EXAMPLE_BLOCK.get()); // example block의 레지스트리 이름, "yourmodid:example_block" 반환
```

어떤 객체가 존재하는지는 아래처럼 확인할 수 있지만, 이땐 오직 이름이 존재하는지만 확인할 수 있습니다:

```java
BuiltInRegistries.BLOCKS.containsKey(new ResourceLocation("minecraft", "dirt")); // true 반환
BuiltInRegistries.BLOCKS.containsKey(new ResourceLocation("create", "brass_ingot")); // Create가 설치되어 있다면 true 반환
```

위 예시처럼 다른 모드가 등록한 요소에도 사용할 수 있기 때문에 다른 모드의 아이템이 존재하는지 확인하는데 최적입니다.

마지막으로, 아래처럼 레지스트리에 등록된 모든 객체들을 순회할 수 있습니다:

```java
for (ResourceLocation id : BuiltInRegistries.BLOCKS.keySet()) { // 이름만 순회함
    // ...
}
for (Map.Entry<ResourceKey<Block>, Block> entry : BuiltInRegistries.BLOCKS.entrySet()) { // 이름과 객체를 같이 순회함
    // ...
}
```

:::note
레지스트리를 조회할 때는 `DeferredRegister`가 아니라 바닐라의 `Registry`를 사용합니다, 왜냐하면 `DeferredRegister`는 단순히 등록을 위한 유틸리티이기 때문에 조회 기능이 없습니다.
:::

:::danger
레지스트리에 아직 등록이 끝나기 전에는 조회하면 안됩니다. **절때 등록이 끝나기 전에 조회하지 마세요!**
:::

## 레지스트리 만들기

직접 레지스트리를 만들면 다른 모드에서도 귀하의 모드를 통해 컨텐츠를 추가할 수 있습니다. 예를 들어 마법 모드를 만든다고 할 때, 주문서 레지스트리를 만들면 다른 모드는 여기에 주문서만 추가해도 귀하의 모드와 잘 동작합니다

먼저 [레지스트리 키][resourcekey]와 레지스트리를 만드세요:

```java
// 여기선 예시로 주문서 레지스트리를 제작합니다.
// 아래 예시는 주문서 이외에도 사용할 수 있습니다.
public static final ResourceKey<Registry<Spell>> SPELL_REGISTRY_KEY = ResourceKey.createRegistryKey(new ResourceLocation("yourmodid", "spells"));
public static final Registry<YourRegistryContents> SPELL_REGISTRY = new RegistryBuilder<>(SPELL_REGISTRY_KEY)
        // 정수 id를 사용해 클라이언트와 동기화 시킴.
        // 정수 아이디는 네트워크에서만 사용하세요.
        .sync(true)
        // 누락된 요소가 있을 때 대신 사용할 기본 이름. 블록 레지스트리의 minecraft:air와 유사합니다. 꼭 지정하지 않아도 됩니다.
        .defaultKey(new ResourceLocation("yourmodid", "empty"))
        // 레지스트리 크기 제한. 일반적으로 안쓰는 것이 좋지만, 네트워트와 동기화 할 때 쓸만합니다.
        .maxId(256)
        // 레지스트리 생성.
        .create();
```

이제, 위에서 만든 레지스트리를 `NewRegistryEvent`에서 마인크래프트의 최상위 레지스트리에 등록합니다: 

```java
@SubscribeEvent
static void registerRegistries(NewRegistryEvent event) {
    event.register(SPELL_REGISTRY);
}
```

위 레지스트리는 다른 레지스트리와 똑같이 `DeferredRegister` 또는 `RegisterEvent`를 사용해 객체를 등록합니다:

```java
public static final DeferredRegister<Spell> SPELLS = DeferredRegister.create("yourmodid", SPELL_REGISTRY);
public static final Supplier<Spell> EXAMPLE_SPELL = SPELLS.register("example_spell", () -> new Spell(...));

// 아니면 RegisterEvent 사용:
@SubscribeEvent
public static void register(RegisterEvent event) {
    event.register(SPELL_REGISTRY_KEY, registry -> {
        registry.register(new ResourceLocation("yourmodid", "example_spell"), () -> new Spell(...));
    });
}
```

## 데이터팩 레지스트리

데이터팩 레지스트리(또는 동적 레지스트리, 아니면 주 사용처인 월드젠 레지스트리라고도 부름)는 게임을 킬 때가 아닌, 월드를 불러올 때 [데이터팩][datapack] JSON에서 요소를 불러오는 레지스트리 입니다. 대표적으로, 마인크래프트는 월드젠에 데이터팩 레지스트리를 사용합니다.

데이터팩 레지스트리는 JSON 파일을 통해 내용을 지정할 수 있습니다, 즉 코드로 뭘 등록할지 지정하지 않아도 됩니다 ([데이터 생성기][datagen]는 번외). 모든 데이터팩 레지스트리는 [`Codec`][codec]을 활용해 각 요소들을 저장합니다. 데이터팩의 JSON 파일 위치는 레지스트리의 이름에 따라 결정됩니다:

- 마인크래프트의 데이터팩 레지스트리는 `data/<모드 아이디>/<레지스트리 이름의 path>` 형식을 사용합니다 (예: 만약 레지스트리의 이름이 `minecraft:worldgen/biomes`라면 `data/<모드 아이디>/worldgen/biomes`를 사용).
- 네오 포지, 또는 모드가 추가한 레지스트리는 `data/<모드 아이디>/<레지스트리 이름의 namespace>/<레지스트리 이름의 path>` 형식을 사용합니다 (예: 만약 레지스트리의 이름이 `neoforge:loot_modifiers`라면 `data/<모드 아이디>/neoforge/loot_modifiers`를 사용).

등록된 데이터팩 레지스트리는 `RegistryAccess`가 관리합니다. 서버에선 `ServerLevel#registryAccess()`, 클라이언트에선 `Minecraft.getInstance().getConnection()#registryAccess()`를 호출해 `RegistryAccess`를 사용할 수 있습니다 (클라이언트는 서버에 접속했을 때만 `RegistryAccess`를 사용할 수 있습니다). 데이터팩 레지스트리는 다른 레지스트리처럼 똑같이 조회하거나 요소를 순회할 수 있습니다.

### 데이터팩 레지스트리 만들기

데이터팩 레지스트리는 `Registry`를 생성할 필요 없이, 레지스트리의 이름과, 요소를 저장하고 불러올 [코덱][codec]만 있으면 됩니다. 위 주문서 예시를 다시 사용한다면, 아래와 같이 주문서 레지스트리를 데이터팩으로 관리할 수 있습니다:

```java
public static final ResourceKey<Registry<Spell>> SPELL_REGISTRY_KEY = ResourceKey.createRegistryKey(new ResourceLocation("yourmodid", "spells"));

@SubscribeEvent
public static void registerDatapackRegistries(DataPackRegistryEvent.NewRegistry event) {
    event.dataPackRegistry(
            // 레지스트리의 이름
            SPELL_REGISTRY_KEY,
            // 레지스트리 요소의 코덱
            Spell.CODEC,
            // 네트워크에 요소를 전송할 때 사용할 코덱.
            // 클라이언트에 필요 없는 정보를 잘라내는 코덱을 사용할 수도 있음.
            // 레지스트리가 클라이언트와 동기화 되지 않는다면 null을 사용하거나
            // 아예 빼버릴 수도 있음, 세번째 인자로 null을 넘기는 동명 메소드가 있음.
            Spell.CODEC
    );
}
```

### 데이터팩 레지스트리의 데이터 생성

JSON 파일을 직접 작성하는 일은 번거롭고 실수도 잦아 네오 포지는 데이터팩 레지스트리의 [JSON 생성기][datagenindex]를 제공합니다. 마인크래프트 기본, 또는 직접 만드신 데이터팩 레지스트리 둘 다 사용 가능합니다.

먼저, `RegistrySetBuilder`를 생성하고 아래처럼 요소를 추가하세요 (`RegistrySetBuilder` 한 개로 여러 데이터팩 레지스트리의 JSON을 생성할 수 있습니다):

```java
new RegistrySetBuilder()
    .add(Registries.CONFIGURED_FEATURE, bootstrap -> {
    // bootstrap을 통해 CONFIGURED_FEATURE 레지스트리에 요소 등록 (아래 참고)
    })
    .add(Registries.PLACED_FEATURE, bootstrap -> {
    // bootstrap을 통해 PLACED_FEATURE 레지스트리에 요소 등록 (아래 참고)
    });
```

`bootstrap` 람다 인자는 생성할 요소를 등록할 때 사용합니다. 타입은 `BootstrapContext`이며 아래처럼 `#register`를 호출해 요소를 등록합니다:

```java
// 생성할 요소의 Resource Key
public static final ResourceKey<ConfiguredFeature<?, ?>> EXAMPLE_CONFIGURED_FEATURE = ResourceKey.create(
    Registries.CONFIGURED_FEATURE,
    new ResourceLocation(MOD_ID, "example_configured_feature")
);

new RegistrySetBuilder()
    .add(Registries.CONFIGURED_FEATURE, bootstrap -> {
        bootstrap.register(
            // 생성할 요소의 Resource Key
            EXAMPLE_CONFIGURED_FEATURE,
            // 생성할 요소
            new ConfiguredFeature<>(Feature.ORE, new OreConfiguration(...))
        );
    })
    .add(Registries.PLACED_FEATURE, bootstrap -> {
    // ...
    });
```

필요하다면 `BootstrapContext`를 사용해 다른 레지스트리의 요소를 조회할 수도 있습니다:

```java
public static final ResourceKey<ConfiguredFeature<?, ?>> EXAMPLE_CONFIGURED_FEATURE = ResourceKey.create(
    Registries.CONFIGURED_FEATURE,
    new ResourceLocation(MOD_ID, "example_configured_feature")
);
public static final ResourceKey<PlacedFeature> EXAMPLE_PLACED_FEATURE = ResourceKey.create(
    Registries.PLACED_FEATURE,
    new ResourceLocation(MOD_ID, "example_placed_feature")
);

new RegistrySetBuilder()
    .add(Registries.CONFIGURED_FEATURE, bootstrap -> {
        bootstrap.register(EXAMPLE_CONFIGURED_FEATURE, ...);
    })
    .add(Registries.PLACED_FEATURE, bootstrap -> {
        HolderGetter<ConfiguredFeature<?, ?>> otherRegistry = bootstrap.lookup(Registries.CONFIGURED_FEATURE);
        bootstrap.register(EXAMPLE_PLACED_FEATURE, new PlacedFeature(
            otherRegistry.getOrThrow(EXAMPLE_CONFIGURED_FEATURE), // CONFIGURED_FEATURE에서 요소 조회
            List.of()
        ));
    });
```

이제 아래와 같이 데이터 생성기에 `RegistrySetBuilder`를 추가하세요:

```java
@SubscribeEvent
static void onGatherData(GatherDataEvent event) {
    event.getGenerator().addProvider(
        // 서버 데이터를 생성할 때만 추가하기
        event.includeServer(),
        // 데이터팩 레지스트리 요소 생성기 준비
        output -> new DatapackBuiltinEntriesProvider(
            output,
            event.getLookupProvider(),
            // 요소를 생성할 RegistrySetBuilder
            new RegistrySetBuilder().add(...),
            // 생성될 요소의 모드 아이디.
            Set.of("yourmodid")
        )
    );
}
```

[block]: ../blocks/index.md
[blockentity]: ../blockentities/index.md
[codec]: ../datastorage/codecs.md
[datagen]: #데이터팩-레지스트리의-데이터-생성
[datagenindex]: ../resources/index.md#data-generation
[datapack]: ../resources/server/index.md
[defregblocks]: ../blocks/index.md#deferredregisterblocks의-기능
[defregitems]: ../items/index.md#deferredregisteritems
[event]: ./events.md
[item]: ../items/index.md
[resloc]: ../misc/resourcelocation.md
[resourcekey]: ../misc/resourcelocation.md#resourcekeys
[singleton]: https://ko.wikipedia.org/wiki/%EC%8B%B1%EA%B8%80%ED%84%B4_%ED%8C%A8%ED%84%B4
