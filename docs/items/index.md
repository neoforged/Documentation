아이템
=====

아이템은 블록들과 마찬가지로 모드의 핵심이 되는 요소입니다. 블록이 플레이어 주변의 레벨을 구성한다면 아이템은 플레이어의 인벤토리를 구성합니다.

아이템 만들기
----------------

아이템을 만들기 위해 먼저 그 속성을 지정해야 합니다. 아이템의 속성은 `Item$Properties`로 저장 및 설정되는데, `Item$Properties`의 인스턴스 생성 이후 여러 메서드를 호출해 아이템을 설정할 수 있습니다. 예를 들어:

|        메서드        | 설명                                                           |
|:-----------------:|:-------------------------------------------------------------|
| requiredFeatures	 | 크리에이티브 탭에서 해당 아이템이 표시되기 위해 필요한 `FeatureFlag` 지정.             |
|    durability	    | 해당 아이템의 최대 damage값 지정. 0 이상일 경우 "damaged", "damage" 속성이 추가됨. | 
|     stacksTo	     | 아이템을 합칠 수 있는 최대 크기 지정. 내구도가 있는 아이템은 합칠 수 없음.                 |                         
|    setNoRepair    | 	아이템을 수리 불가능하게 만듦.                                           |                                                    
|  craftRemainder	  | 아이템을 조합에 사용한 이후 남을 아이템 지정, 예: 용암 양동이를 조합에 사용하면 빈 양동이가 남음.    |

위 메서드들은 자기 자신을 반환하기에 연속적으로 이어 붙일 수 있습니다. 따로 특수한 기능이 없는 간단한 아이템들(막대기나 설탕)은 단순히 `Item`의 생성자에 `Item$Properties`를 전달해 만들면 됩니다. 만약 아이템에 추가 기능(예: 우클릭시 메뉴가 열림)을 구현하시려면 `Item`의 자식 클래스를 만들고 필요에 따라 몇몇 메서드를 재정의하셔야 합니다.

아이템은 무조건 [등록][registering]되어야만 정상적으로 작동합니다.

## 크리에이티브 탭

아이템은 [모드 이벤트 버스][modbus]에 방송되는 `BuildCreativeModeTabContentsEvent`를 통해 `CreativeModeTab`에 추가될 수 있습니다. 추가 설정 필요 없이 `#accept`로 바로 추가할 수 있습니다.

```java
// 아래 핸들러는 이벤트 버스에 등록됨
// ITEM이라는 RegistryObject<Item>과 BLOCK이라는 RegistryObject<Block>가 있다고 가정
@SubscribeEvent
public void buildContents(BuildCreativeModeTabContentsEvent event){
    // 재료 탭에 아이템 추가
    if(event.getTabKey() == CreativeModeTabs.INGREDIENTS){
        event.accept(ITEM);
        event.accept(BLOCK); // #accepts는 ItemLike도 인자로 받아 블록에 대응되는 아이템으로 변환해 등록함
    }
}
```

아이템의 크리에이티브 탭 추가 여부는 `FeatureFlagSet`의 `FeatureFlag`, 또는 사용자가 관리자 도구 탭을 볼 권한이 있는지 결정하는 boolean에 따라 결정할 수도 있습니다.

### 직접 크리에이티브 탭 만들기

`CreativeModeTab`은 빌더를 통해 만듭니다. 빌더는 `#builder`를 호출해 생성할 수 있습니다. 만든 크리에이티브 탭은 레지스트리에 [등록][registering]하셔야 합니다.
탭은 제목, 아이콘, 기본 아이템 등 여러 속성들을 가질 수 있습니다. 추가적으로, 포지는 라벨, 탭 이미지, 제목과 슬롯 색상, 탭 순서 등의 속성도 추가합니다.

```java
// REGISTER라는 DeferredRegister<CreativeModeTab>가 있다고 가정함
public static final RegistryObject<CreativeModeTab> EXAMPLE_TAB = REGISTER.register("example", () -> CreativeModeTab.builder()
    // 탭 이름 설정
    .title(Component.translatable("item_group."+MOD_ID+".example"))
    // 탭 아이콘 설정
    .icon(()->new ItemStack(ITEM.get()))
    // 기본 아이템 추가
    .displayItems((params,output)->{
        output.accept(ITEM.get());
        output.accept(BLOCK.get());
    })
    .build()
);
```

[modbus]: ../concepts/events.md#모드-이벤트-버스
[registering]: ../concepts/registries.md#객체-등록하기
