# 상태 효과 & 물약

상태 효과, 또는 포션 이펙트는 코드에선 `MobEffect`라 불리며, 매 틱마다 엔티티에 영향을 줍니다. 이 문서에선 상태 효과 사용법, 효과와 물약의 차이, 그리고 새로운 효과를 만드는 방법에 대해 다루겠습니다.

## 용어

- `MobEffect`는 상태 효과로, 매 틱 마다 엔티티에 영향을 줍니다. [블록][block]이나 [아이템][item]처럼, `MobEffect`는 레지스트리에 [등록][registration]되어야 정상적으로 동작합니다.
  - **즉시 효과**는 특수한 상태 효과로, 영향을 한 틱만 줍니다. 즉시 치유, 즉시 피해가 이에 해당합니다.
- `MobEffectInstance`는 `MobEffect`와 지속 시간, 강도 등을 저장합니다 (아래 참고). `MobEffectInstance`와 `MobEffect`의 관계는 [`ItemStack`][itemstack]과 `Item`의 관계와 유사합니다.
- `Potion`은 `MobEffectInstance`의 집합입니다. 바닐라 마인크래프트는 네 개의 물약 아이템에만 포션을 사용합니다 (아래 참고). 하지만 아이템이 포션을 사용할 줄만 안다면 아무 아이템에다 적용하셔도 괜찮습니다.
- **포션 아이템**은 포션이 적용되어야 하는 아이템입니다. 이는 `PotionItem` 클래스와 아무런 연관이 없습니다 (이 클래스는 물약 아이템을 구현하는 데 사용됩니다). 마인크래프트에는 기본적으로 이러한 아이템이 네 가지가 있는 데: 물약, 투척용 물약, 잔류형 물약, 화살촉입니다. 또한 모드에서 다른 아이템도 추가할 수 있습니다.

## `MobEffect`

새로운 `MobEffect`를 만들려면, 먼저 `MobEffect`의 하위 클래스를 만드세요:

```java
public class MyMobEffect extends MobEffect {
    public MyMobEffect(MobEffectCategory category, int color) {
        super(category, color);
    }
    
    @Override
    public void applyEffectTick(LivingEntity entity, int amplifier) {
        // 상태 효과의 구체적인 기능을 여기서 구현하세요
    }
    
    // 이번 틱에 효과가 적용되어야 할지를 결정합니다. 예를 들어 재생 물약이 강도에 따라
    // 몇 틱에 한 번씩만 사용자를 회복시켜 주는 데 사용합니다.
    @Override
    public boolean shouldApplyEffectTickThisTick(int tickCount, int amplifier) {
        return tickCount % 2 == 0; // 2 틱에 한 번씩만 효과를 적용함
    }
    
    // 효과가 새로 추가되었을 때 실행되는 유틸리티
    @Override
    public void onEffectStarted(LivingEntity entity, int amplifier) {
    }
}
```

여타 레지스트리 객체와 동일하게, `MobEffect` 또한 아래와 같이 등록되어야 합니다:

```java
//MOB_EFFECTS는 DeferredRegister<MobEffect>
public static final Supplier<MyMobEffect> MY_MOB_EFFECT = MOB_EFFECTS.register("my_mob_effect", () -> new MyMobEffect(
        // 아래 값은 BENEFICIAL, NEUTRAL 또는 HARMFUL로 지정할 수 있음. 포션의 툴팁 글자 색상을 결정하는 데 사용함.
        MobEffectCategory.BENEFICIAL,
        // 포션의 파티클 색상.
        0xffffff
));
```

포션 효과를 단순히 마커로만 사용하려면, `Block`이나 `Item`을 만들 때와 동일하게 바로 `MobEffect` 클래스의 인스턴스를 만드셔도 됩니다.

`MobEffect` 클래스는 엔티티에 속성을 추가하는 기본적인 기능도 제공합니다. 예를 들어 신속 효과는 엔티티에 속성을 추가하여 이동 속도를 조절합니다. 속성은 다음과 같이 추가할 수 있습니다:

```java
public static final String MY_MOB_EFFECT_UUID = "01234567-89ab-cdef-0123-456789abcdef";
public static final Supplier<MyMobEffect> MY_MOB_EFFECT = MOB_EFFECTS.register("my_mob_effect", () -> new MyMobEffect(...)
        .addAttributeModifier(Attribute.ATTACK_DAMAGE, MY_MOB_EFFECT_UUID, 2.0, AttributeModifier.Operation.ADD)
);
```

:::note
UUID는 무조건 올바르고 고유한 UUIDv4여야 합니다. 모장은 무슨 이유에선가 텍스트로 구분하는 것이 아닌 UUID로 각 속성을 구분합니다. 새 UUID는 [이곳][uuidgen]과 같은 사이트에서 생성하실 수 있습니다.
:::

### `InstantenousMobEffect`

즉시 적용되는 효과를 만들고 싶으시다면, 아래와 같이 `InstantenousMobEffect`를 대신 사용하실 수 있습니다:

```java
public class MyMobEffect extends InstantenousMobEffect {
    public MyMobEffect(MobEffectCategory category, int color) {
        super(category, color);
    }

    @Override
    public void applyEffectTick(LivingEntity entity, int amplifier) {
        // 효과를 여기서 구현하세요
    }
}
```

이후 `MobEffect`와 동일하게 레지스트리에 등록하셔야 합니다.

### 이벤트

여러 효과들은 그 기능이 다른 곳에 구현된 경우가 많습니다. 예를 들어 공중 부양의 경우 엔티티 물리 연산에서 날아다니는 기능이 구현되어 있습니다. 모드에서 추가한 효과도 이와 유사한 기능을 만들 수 있도록 네오 포지는 여러 [이벤트][events]들을 제공합니다:

- `MobEffectEvent.Applicable`는 `MobEffectInstance`를 엔티티에 적용할 수 있는지 확인할 때 방송됨. 효과 부여를 차단 또는 강행할 때 사용할 수 있음.
- `MobEffectEvent.Added`는 `MobEffectInstance`가 추가되면 방송되는 이벤트. 대상 엔티티가 새로운 효과를 부여받기 이전에 또 다른 `MobEffectInstance`가 있었다면 이 또한 이벤트를 통해 전달됨.`MobEffectEvent.Expired`는 `MobEffectInstance`가 만료되면 방송됨. 예: 효과 지속 시간이 0이 됨.
- `MobEffectEvent.Remove`는 상태 효과가 만료 이외의 이유로 제거되었을 때 방송됨. 예: 우유를 마심, 명령어로 제거함

## `MobEffectInstance`

`MobEffectInstance`는, 단순히 말해서, 엔티티에 적용된 상태 효과입니다. `MobEffectInstance`는 다음과 같이 생성합니다:

```java
MobEffectInstance instance = new MobEffectInstance(
        // 사용할 상태 효과 종류.
        MobEffects.REGENERATION,
        // 상태 효과의 지속시간. 0이 기본값.
        500,
        // 상태 효과 강도. 0이 최솟값 및 기본값.
        0,
        // 상태 효과가 주변 환경에 의해 부여됐는지 여부.
        // 신호기 또는 전달체의 경우 true를 사용함. false가 기본값.
        false,
        // 상태 효과가 인벤토리에 표시되는지 여부. true가 기본값.
        true,
        // 상태 효과가 화면 우 상단에 표시되는지 여부. true가 기본값.
        true
);
```

이것 말고도 `MobEffectInstance`에는 뒤 5개의 인자들이 하나씩 누락된 생성자들이 다수 있습니다.

:::info
`MobEffectInstance`의 값은 변경될 수 있습니다. 만약 복사를 하고 싶으시다면 `new MobEffectInstance(oldInstance)`를 호출하세요.
:::

### `MobEffectInstance` 응용하기

`MobEffectInstance`는 아래와 같이 엔티티에 적용할 수 있습니다:

```java
MobEffectInstance instance = new MobEffectInstance(...);
entity.addEffect(instance);
```

비슷하게 `MobEffectInstance`를 제거할 수도 있습니다. 엔티티에 같은 `MobEffect`를 가지는 `MobEffectInstance`를 여러 번 적용할 수 없어 같은 효과를 다시 적용하면 기존 효과는 제거됩니다. 각 상태 효과당 `MobEffectInstance`는 하나만 있으므로 상태 효과는 아래와 같이 `MobEffect`만 지정하여도 제거할 수 있습니다:

```java
entity.removeEffect(MobEffects.REGENERATION);
```

:::info
`MobEffect`는 오직 플레이어, 몬스터와 같은 `LivingEntity`의 하위 클래스에만 적용할 수 있습니다. 아이템 엔티티나 눈덩이에는 적용할 수 없습니다.
:::

## `Potion`

`Potion`은 아래와 같이 섭취 시 적용할 `MobEffectInstance`들을 생성자에 전달하여 생성할 수 있습니다:

```java
//POTIONS은 DeferredRegister<Potion>
public static final Supplier<Potion> MY_POTION = POTIONS.register("my_potion", () -> new Potion(new MobEffectInstance(MY_MOB_EFFECT.get(), 3600)));
```

위 생성자의 인자는 가변 인자입니다, 상태 효과들을 원하시는 만큼 추가할 수 있습니다. 이때 상태 효과가 없는 포션을 만드는 것도 가능한데, 단순히 `new Potion()`을 호출하시면 됩니다. (마인크래프트는 어색한 포션을 이렇게 만듭니다.) 

포션의 이름은 위 생성자의 첫 번째 인자로 전달합니다. 이는 번역에 사용되는 값으로, 바닐라는 이를 활용해 강한 포션과 오래가는 포션이 기본 포션에 같은 이름을 부여합니다. 이름은 누락되어도 되며, 레지스트리에서 대신 가져옵니다.

`PotionUtils`는 포션을 다루는 데 여러 유용한 메서드들을 제공합니다, 예를 들어 아이템 스택의 포션을 다루는 `getPotion` 및 `setPotion` (이때 아이템 스택은 포션 아이템 말고 다른 아이템도 사용 가능합니다), 또는 포션의 색상을 가져오는 `getColor` 등이 있습니다.

### 양조기

이제 포션을 추가했으니, 서바이벌 모드에서 추가한 포션을 얻을 수 있도록 양조기의 조합법을 추가해 봅시다.

양조기의 조합법은 [데이터 팩][datapack]으로 수정할 수 없기 때문에 아래와 같이 직접 조합법 레지스트리를 수정하여야 합니다:

```java
// 양조기 재료. 양조기 맨 위에 들어가는 아이템임.
Ingredient brewingIngredient = Ingredient.of(Items.FEATHER);
BrewingRecipeRegistry.addRecipe(
        // 재료로 사용되는 포션, 대개 어색한 포션을 사용함. 양조기 아래에 들어가는 아이템임.
        // 물약 아이템이 아니어도 되지만 거의 물약만 사용함.
        PotionUtils.setPotion(new ItemStack(Items.POTION), Potions.AWKWARD),
        // 양조기 재료.
        brewingIngredient,
        // 결과로 나올 아이템. 물약이 아니어도 되지만 거의 물약만 사용함.
        PotionUtils.setPotion(new ItemStack(Items.POTION), MY_POTION)
);
// 잔류형 및 투척용 물약의 레시피도 위와 같이 추가하여야 함.
// 포션 화살은 제작대가 알아서 처리하니 상관없음.
BrewingRecipeRegistry.addRecipe(
        PotionUtils.setPotion(new ItemStack(Items.SPLASH_POTION), Potions.AWKWARD),
        brewingIngredient,
        PotionUtils.setPotion(new ItemStack(Items.SPLASH_POTION), MY_POTION)
);
BrewingRecipeRegistry.addRecipe(
        PotionUtils.setPotion(new ItemStack(Items.LINGERING_POTION), Potions.AWKWARD),
        brewingIngredient,
        PotionUtils.setPotion(new ItemStack(Items.LINGERING_POTION), MY_POTION)
);
```

위 코드를 게임을 불러오는 과정 중 호출하세요, [`FMLCommonSetupEvent`][commonsetup] 등을 사용하실 수 있습니다. 이때 `event.enqueueWork()`를 사용해 메인 스레드를 통해서 추가하세요. 위 레지스트리는 경쟁 상태를 유발할 수 있습니다.

[block]: ../blocks/index.md
[commonsetup]: ../concepts/events.md#모드-이벤트-버스
[datapack]: ../resources/server/index.md
[events]: ../concepts/events.md
[item]: index.md
[itemstack]: index.md#itemstack
[registration]: ../concepts/registries.md
[uuidgen]: https://www.uuidgenerator.net/version4
