레지스트리
==========

마인크래프트는 레지스트리를 이용해 블록 및 아이템과 같은 객체들에 접근합니다. 이러한 객체들은 모두 레지스트리에 등록되어야 합니다; 등록되지 않은 객체들은 게임이 정상적으로 처리할 수 없습니다.

레지스트리는 `Map<ResourceLocation, V>`의 형태를 가지며, 대개 포지에서 관리합니다, 포지에서 확장하는 모든 레지스트리를 보려면 `ForgeRegistries` 클래스를 참조하세요. 키로 사용되는 [`ResourceLocation`][ResourceLocation]은 등록된 객체의 **레지스트리 이름**처럼 사용할 수 있습니다.

블록, 아이템 등 객체의 종류마다 레지스트리가 따로 존재합니다. 그리고 각 레지스트리는 `ResourceKey`로 구분합니다.

한 레지스트리의 객체들의 이름은 겹치면 안됩니다, 나중에 등록된 객체가 기존 것을 덮어 씌웁니다. 그러나 서로 다른 레지스트리에 있는 객체들은 같은 이름을 가지고 있어도 됩니다.

객체 등록하기
------------------

객체를 올바르게 등록하는 방법에는 2가지가 있는데, `DeferredRegister`와 `RegistryEvent` 입니다.

### DeferredRegister

`DeferredRegister`는 위 두 가지중 권장되는 것으로, 정적 초기화로 단순하게 객체를 등록할 수 있도록 해주는 유틸리티 입니다.

`DeferredRegister`는 `#create`를 사용해 생성하실 수 있습니다. 이때 `DeferredRegister`를 사용할 레지스트리, 그리고 등록할 객체들의 네임 스페이스로 사용할 MODID를 전달합니다.
이후 `#register`에 등록시킬 객체의 이름과 해당 객체를 공급하는 `Supplier<T>`를 넘겨 나중에 해당 레지스트리의 `RegistryEvent`가 방송될 때 자동으로 등록되도록 합니다.
```java
// 블록들을 등록하는 DeferredRegister 인스턴스 만들기
private static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(ForgeRegistries.BLOCKS, "examplemod");

// DeferredRegister 인스턴스를 통해 블록 등록하기
public static final RegistryObject<Block> ROCK_BLOCK = BLOCKS.register(
    "rock", // 이 문자열은 BLOCK에 전달한 네임 스페이스와 합쳐져 나중에 "examplemod:rock"이란 이름으로 등록됨
    () -> new Block(BlockBehaviour.Properties.of().mapColor(MapColor.STONE))
);

public ExampleMod() {
    // DeferredRegister가 RegistryEvent에 반응할 수 있도록 모드 버스에 등록시키기
    BLOCKS.register(FMLJavaModLoadingContext.get().getModEventBus());
}
```

### `RegisterEvent`

`RegistryEvent`는 레지스트리에 직접 객체를 등록할 때 사용하는 [이벤트] 입니다. 이벤트 핸들러에서 레지스트리의 `ResourceKey`, 등록할 객체의 레지스트리 이름과 객체 자체를 `#register`에 전달하여 등록하실 수 있습니다.

해당 이벤트는 모든 레지스트리마다 방송되는데, `RegistryEvent#getRegistryKey`로 원하시는 레지스트리가 맞는지 먼저 확인하시는 것을 권장드립니다, 이 이벤트는 `#register`에 전달된 `ResourceKey`와 이벤트가 방송된 레지스트리가 일치하지 않으면 아무런 동작도 하지 않지만, 그래도 불필요한 인스턴스 생성을 줄일 수 있습니다.

추가적으로, 아래 예시와 같이 `ResourceKey`와 람다 함수를 대신 인자로 넘길 수도 있습니다. 전달하는 람다 함수는 `ResourceKey`가 일치하는 경우에만 실행됩니다.

예시(이 이벤트 핸들러는 무조건 *모드 버스*에 등록되어야 합니다):

```java
// 직접 RegistryKey 확인하기
@SubscribeEvent
public void registerA(RegisterEvent event) {
    if (event.getResourceKey().equals(Registries.BLOCK)) {
        helper.register(new ResourceLocation(MODID, "example_block_1"), new Block(...));
        helper.register(new ResourceLocation(MODID, "example_block_2"), new Block(...));
        helper.register(new ResourceLocation(MODID, "example_block_3"), new Block(...));
        // ...  
    }
}

// 람다 함수 사용하기
@SubscribeEvent
public void registerB(RegisterEvent event) {
    event.register(ForgeRegistries.Keys.BLOCKS,  helper -> {
        helper.register(new ResourceLocation(MODID, "example_block_1"), new Block(...));
        helper.register(new ResourceLocation(MODID, "example_block_2"), new Block(...));
        helper.register(new ResourceLocation(MODID, "example_block_3"), new Block(...));
        // ...
    });
}
```

### 포지가 확장하지 않는 레지스트리들

포지가 모든 레지스트리를 확장하진 않습니다. 대표적으로 `LootItemConditionType` 과 같은 정적 레지스트리, 대개 JSON으로 표현되는 `ConfiguredFeature`와 같은 월드 생성 관련 동적 레지스트리들이 있습니다.

이러한 레지스트리는 `ForgeRegistries`에 수록되어 있지 않습니다. 여기에 `DeferredRegister`를 사용하시려면 `DeferredRegister#create`에 레지스트리 대신 `ResourceKey`를 전달하셔야 합니다.

:::danger
동적 레지스트리는 **오직** JSON과 같은 데이터 파일로만 관리할 수 있습니다, 코드로는 여기에 객체를 등록하실 수 없습니다.
:::

```java
// Registries.LOOT_CONDITION_TYPE는 마인크래프트에서 사전 정의해둔 ResourceKey 
private static final DeferredRegister<LootItemConditionType> REGISTER = DeferredRegister.create(Registries.LOOT_CONDITION_TYPE, "examplemod");

public static final RegistryObject<LootItemConditionType> EXAMPLE_LOOT_ITEM_CONDITION_TYPE = REGISTER.register("example_loot_item_condition_type", () -> new LootItemConditionType(...));
```

:::note
레지스트리는 오직 게임에 존재하는 객체들의 종류만을 수록해야 합니다, `ItemStack`이나 `Entity`와 같은 클래스는 같은 종류의 객체가 다수 존재할 수 있어 레지스트리에 등록할 수 없습니다.

그 대신, 이들의 종류를 상징하는 클래스를 대신 등록해야 합니다. `ItemStack`은 `Item`, `Entity`는 `EntityType`, [`BlockEntity`][블록엔티티]는 `BlockEntityType`이 대신 레지스트리에 등록됩니다.

이중 `BlockEntityType`과 `EntityType`은 내부 클래스 `Builder`로 생성하며, 해당하는 `BlockEntity` 및 `Entity`를 생성할 람다 함수가 필요합니다.
```java
public static final DeferredRegister<BlockEntityType> REGISTER = // ...

public static final RegistryObject<BlockEntityType<ExampleBlockEntity>> EXAMPLE_BLOCK_ENTITY = REGISTER.register(
    "example_block_entity",
    () -> BlockEntityType.Builder.of(
        (type, level) -> new ExampleBlockEntity(type, level), // ExampleBlockEntity를 생성하는 람다 함수 전달
        EXAMPLE_BLOCK.get()
    ).build(null)
);
```
:::

등록된 객체 참조하기
------------------------------

등록된 객체를 참조하실 땐 이를 특정 필드에 저장하면 안됩니다, `RegistryEvent` 이벤트가 방송될 때 다시 만들어 질 수 있기 때문입니다. 이는 추후에 포지에서 동적으로 모드를 활성화/비활성화하기 위함입니다.

등록되는 객체들은 무조건 `RegistryObject` 또는 `@ObjectHolder` 어노테이션이 있는 필드를 통하여 참조되어야만 합니다. `@ObjectHolder` 어노테이션과 `RegistryObject`는 `RegistryEvent` 가 방송될 때 자동으로 갱신됩니다.

### RegistryObject 로 참조하기

`RegistryObject`는 레지스트리에 등록된 객체를 감싸는 클래스로, 대표적으로 `DeferredRegister`가 객체를 등록하고 `RegistryObject`를 반환합니다.

등록된 객체는 `RegistryObject#get`으로 참조하실 수 있습니다. 만약 아직 객체가 등록되지 않았거나 등록 과정에서 문제가 발생했으면 `null`을 반환합니다.

이미 등록된 객체의 `RegistryObject`를 얻기 위해선 `RegistryObject#create`에 참조할 객체의 레지스트리 이름, 그리고 알맞은 레지스트리(또는 `ResourceKey`)를 사용하여 호출하세요.

`RegistryObject` 사용 예시:

```java
public static final RegistryObject<Item> BOW = RegistryObject.create(new ResourceLocation("minecraft:bow"), ForgeRegistries.ITEMS);

// 아래 예시에서는 'neomagicae:mana_type'은 레지스트리, 'neomagicae:coffeinum'은 객체의 이름이라 가정합니다
public static final RegistryObject<ManaType> COFFEINUM = RegistryObject.create(new ResourceLocation("neomagicae", "coffeinum"), new ResourceLocation("neomagicae", "mana_type"), "neomagicae");
```

### @ObjectHolder 사용하기

`@ObjectHolder`는 특정 필드에 레지스트리에 등록된 객체를 주입하는 어노테이션입니다. 이를 클래스 또는 필드에 표시하고 아래와 같이 주입될 객체의 레지스트리 이름을 지정하시면 됩니다:
* 만약 클래스가 `@Mod`로 표시되어 있다면, `modid`를 그 클래스의 네임 스페이스 기본값으로 사용합니다.
* 필드가 다음 조건들을 전부 충족시킨다면 주입이 이루어 집니다:
  * 최소한 `public static` 키워드가 있음.
  * **필드**가 `@ObjectHolder`로 표시되어 있고,
    * 참조할 객체의 레지스트리 이름이 명시되어 있고,
    * 참조할 객체가 들어있는 레지스트리가 명시되어 있음.
  * _만약 필드에 위 두가지가 지정되어 있지 않다면 컴파일 오류가 발생함._
* _만약 지정된 레지스트리 이름 또는 레지스트리가 올바르지 않다면 예외가 발생합니다._

:::note
만약 주입될 객체가 존재하지 않는다면 이에 관한 메세지가 출력되고 필드에는 값이 주입되지 않습니다.
:::

위에 기술된 규칙들이 복잡해 보이실 수 있으니, 아래 예제를 준비해 보았습니다:

```java
class Holder {
  @ObjectHolder(registryName = "minecraft:enchantment", value = "minecraft:flame")
  public static final Enchantment flame = null;     // 어노테이션 있음. [public static] 요구됨. [final] 선택사항.
                                                    // 지정된 레지스트리: "minecraft:enchantment"
                                                    // 지정된 객체: "minecraft:flame"
                                                    // 주입될 객체: 화염 인첸트

  public static final Biome ice_flat = null;        // 어노테이션 없음.
                                                    // 이 필드는 무시됨.

  @ObjectHolder("minecraft:creeper")
  public static Entity creeper = null;              // 어노테이션 있음. [public static] 요구됨.
                                                    // 레지스트리 지정 안됨.
                                                    // 컴파일 오류 발생.

  @ObjectHolder(registryName = "potion")
  public static final Potion levitation = null;     // 어노테이션 있음. [public static] 요구됨. [final] 선택사항.
                                                    // 지정된 레지스트리: "minecraft:potion"
                                                    // 객체 지정 안됨.
                                                    // 컴파일 오류 발생.
}
```

새로운 레지스트리 정의하기
--------------------------------

모드에서 새로운 레지스트리를 정의할 때 Map을 사용하여 만드는 경우는 꽤나 흔합니다; 그러나 이는 강제적으로 코드상 의존성을 만들어 레지스트리가 존재하지 않을 경우 오류 처리도 못하고 바로 게임이 충돌합니다. 또한 사이드간의 데이터 동기화를 수동으로 해야 한다는 단점 또한 있습니다. 포지에선 이러한 의존성을 피하고, 자동으로 동기화를 해 주며(설정시 변경 가능) 관리또한 자동으로 하는 대안을 제공합니다.

새로운 레지스트리는 `NewRegistryEvent` 또는 `DeferredRegister`를 통해 `RegistryBuilder`를 사용하여 만듭니다. `RegistryBuilder` 는 레지스트리의 이름, 레지스트리에 등록될 객체들의 클래스, 여러 이벤트들에 반응할 콜백들 등 여러가지 설정 가능한 속성들이 있습니다. 새롭게 만들어진 레지스트리들은 `RegistryManager` 에 `NewRegistryEvent` 가 끝나고 등록됩니다.

새롭게 생성된 레지스트리의 사용 방법은 동일하기 때문에 [기존 방법들][등록]로 동일하게 객체들을 등록하실 수 있습니다.

### NewRegistryEvent 쓰기

`NewRegistryEvent`를 사용할 때, `#create`를 호출하면 레지스트리를 감싸는 `Supplier<IForgeRegistry<V>>`가 반환됩니다. 이 `Supplier`는 `NewRegistryEvent`가 끝나기 전에는 `null`을, 끝난 이후에는 생성된 레지스트리를 반환합니다.

### DeferredRegister 쓰기

`DeferredRegister`는 이번에도 위 이벤트를 응용해 새로운 레지스트리를 만듭니다. `DeferredRegister`를 레지스트리 이름과 모드 아이디를 인자로 받는 오버로드 메서드 `#create`를 통해 생성하고, `DeferredRegister#makeRegistry`를 통해 레지스트리를 생성하실 수 있습니다. 이 메서드는 `RegistryBuilder`를 감싸는 `Supplier`를 인자로 받습니다.

`#makeRegistry`는 자동으로 `RegistryBuilder#setName`을 호출합니다. 또한 위처럼 `Supplier<IForgeRegistry<V>>`를 대신 반환합니다. `NewRegistryEvent`가 끝나기 이전 `#get`을 호출하면 `null`이 대신 반환됩니다.

:::caution
`DeferredRegister#makeRegistry`는 무조건 `DeferredRegister#register`를 통해 모드 버스에 등록되기 이전에 호출되어야만 합니다.
:::

#### 새로운 데이터팩 레지스트리 만들기

새로운 데이터팩 레지스트리는 모드 이벤트 버스에서 `DataPackRegistryEvent$NewRegistry` 이벤트로 정의할 수 있습니다. `#dataPackRegistry`에 레지스트리의 이름을 표현하는 `ResourceKey`와 JSON으로부터 레지스트리 객체를 읽고 쓸 `Codec`을 전달하시면 됩니다. 클라이언트와 레지스트리를 동기화 해야 한다면 동기화용 `Codec` 또한 전달하세요. 

:::note
데이터팩 레지스트리는 `DeferredRegister`로 만들 수 없습니다. 오직 위 이벤트로만 만들 수 있습니다.
:::

누락된 항목 처리하기
------------------------

모드가 업데이트 되거나 제거되었을 때 레지스트리의 객체가 누락될 수도 있습니다. 이때 `MissingMappingsEvent`가 방송되는데, `#getMappings`에 매핑을 받아올 레지스트리의 키와 모드 아이디를 전달해 누락된 매핑 리스트를 받아올 수 있으며, `#getAllMappings`를 통해 모드 아이디와 관련 없이 누락된 모든 매핑들을 받아올 수 있습니다.

:::caution
`MissingMappingsEvent`는 다른 레지스트리 이벤트와 다르게 **포지** 버스에서 방송됩니다.
:::

각 매핑마다 아래 4가지 메서드중 하나를 호출하여 누락된 항목을 어떻게 처리할지 선택할 수 있습니다:

|            메서드            | 설명                |
|:-------------------------:|:------------------|
|     `Mapping#ignore`      | 누락된 항목을 버립니다.     |
|      `Mapping#warn`       | 로그에 경고를 띄웁니다.     |
|      `Mapping#fail`       | 월드를 불러오는 것을 막습니다. |
| `Mapping#remap(T target)` | 다른 항목으로 대체합니다.    |

만약 누락된 항목을 처리하는 방법이 지정되지 않았다면 플레이어에게 이에 대해 알리고 월드를 계속 불러올 것인지 물어봅니다. `remap`제외한 다른 동작의 경우 누락된 항목이 다시 추가될 수 있으니 다른 객체들이 누락된 항목의 id를 대체하는 것을 막습니다.

[ResourceLocation]: ./resources.md#resourcelocation
[등록]: #객체-등록하기
[이벤트]: ./events.md
[블록엔티티]: ../blockentities/index.md
