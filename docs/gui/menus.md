# 메뉴

메뉴는 그래픽 유저 인터페이스(GUI)의 벡엔드중 하나로, 외부 데이터와 상호작용합니다. 메뉴 자체는 데이터를 저장하지 않고, 오직 사용자가 데이터와 간접적으로 상호작용할 수 있도록 합니다. 다시 말해서 데이터는 특정 메뉴랑 결합(coupling)하지 말아야 하며 그 참조만 전달해야 합니다. 

## `MenuType`

메뉴 자체는 동적으로 생성되고 제거되기에 레지스트리 객체가 아닙니다. 그래서 `Menu`를 필요에 따라 생성할 수 있는 `MenyType`이 대신 레지스트리에 등록되어 메뉴들을 그 *종류*로 구분합니다.

`MenuType`은 무조건 [등록][registered]되어야 합니다.

### `MenuSupplier`

`MenuType`의 생성자는 `MenuSupplier`와 `FeatureFlagSet`을 인자로 받습니다. `MenuSupplier`는 컨테이너의 id와 메뉴를 사용하는 플레이어의 인벤토리로 [`AbstractContainerMenu`][acm]를 생성하는 함수입니다.

```java
// REGISTER라는 DeferredRegister<MenuType<?>>가 있을 때
public static final RegistryObject<MenuType<MyMenu>> MY_MENU = REGISTER.register("my_menu", () -> new MenuType(MyMenu::new, FeatureFlags.DEFAULT_FLAGS));

// AbstractContainerMenu의 하위 클래스 MyMenu
public MyMenu(int containerId, Inventory playerInv) {
  super(MY_MENU.get(), containerId);
  // ...
}
```

:::note
컨테이너의 id는 각 플레이어에게만 고유합니다, 두 사람이 사용하는 컨테이너 id가 같아도 언제나 두 개의 메뉴로 표현됩니다.
:::

서버의 데이터는 상황에 따라 동적으로 변할 수도 있지만 클라이언트는 단순히 이를 받아 저장만 합니다. `MenuSupplier`는 주로 클라이언트에서 서버가 보낸 정보를 저장한 데이터를 사용하는 메뉴를 만들 때 쓰입니다.

### `IContainerFactory`

만약 클라이언트에 컨테이너 id 및 인벤토리 이외의 추가 정보(예: 컨테이너 블록의 위치)가 필요하다면, `IContainerFactory`를 대신 사용할 수 있습니다. id 및 인벤토리 이외에도 `FriendlyByteBuf` 또한 인자로 제공되어 서버에서 추가 정보를 담을 수 있습니다. 이후 `IForgeMenuType`에 `IContainerFactory`를 넘겨 `MenuType`으로 만들 수 있습니다. 

```java
// REGISTER라는 DeferredRegister<MenuType<?>>가 있을 때
public static final RegistryObject<MenuType<MyMenuExtra>> MY_MENU_EXTRA = REGISTER.register("my_menu_extra", () -> IForgeMenuType.create(MyMenu::new));

// AbstractContainerMenu의 하위 클래스 MyMenuExtra
public MyMenuExtra(int containerId, Inventory playerInv, FriendlyByteBuf extraData) {
  super(MY_MENU_EXTRA.get(), containerId);
  // 버퍼에서 데이터 읽기
  // ...
}
```

## `AbstractContainerMenu`

모든 메뉴는 `AbstractContainerMenu`의 하위 클래스입니다. 메뉴는 종류를 표현하는 [`MenuType`][mt], 그리고 현재 사용자에게 고유한 컨테이너 id를 생성자 인자로 받습니다.

:::caution
플레이어는 한 번에 최대 100개의 각기 다른 메뉴만 열 수 있습니다.
:::

각 메뉴는 일반적으로 서버용, 그리고 클라이언트용 생성자 두 개를 가집니다. 클라이언트용 생성자는 `MenuType`을 인자로 받습니다. 서버용 생성자가 초기화하는 필드는 클라이언트에선 기본값으로 초기화 되어야 합니다.

```java
// 클라이언트용 메뉴 생성자
public MyMenu(int containerId, Inventory playerInventory) {
  this(containerId, playerInventory);
}

// 서버용 메뉴 생성자
public MyMenu(int containerId, Inventory playerInventory) {
  // ...
}
```

각 메뉴는 `#stillValid`와 [`#quickMoveStack`][qms]를 구현해야 합니다.

### `#stillValid`와 `ContainerLevelAccess`

`#stillValid`는 아직도 메뉴가 사용자에게 열려있어야 하는지를 결정합니다. 이 메서드는 클라이언트에선 언제나 `true`를 반환합니다. 대개 `#stillValid`는 `ContainerLevelAccess`, 사용자, 그리고 메뉴와 연결된 `Block`을 받는 `AbstractContainerMenu#stillValid`를 호출하며, 이는 클라이언트에선 `true`를 반환합니다. 이 메서드의 역할은 플레이어가 메뉴의 데이터로부터 8칸 이내에 있는지 확인합니다.

`ContainerLevelAccess`는 현재 차원과 블록의 위치를 메뉴에 전달합니다. 서버에서 새 메뉴를 생성할 때, `ContainerLevelAccess#create`를 호출해 생성할 수 있습니다. 클라이언트는 대신 아무 역할도 하지 않는 `#NULL`을 사용합니다.

```java
// 클라이언트용 메뉴 생성자
public MyMenuAccess(int containerId, Inventory playerInventory) {
  this(containerId, playerInventory, ContainerLevelAccess.NULL);
}

// 서버용 메뉴 생성자
public MyMenuAccess(int containerId, Inventory playerInventory, ContainerLevelAccess access) {
  // ...
}

// MY_BLOCK이 해당 메뉴와 연결되어 있다고 가정함.
@Override
public boolean stillValid(Player player) {
  return AbstractContainerMenu.stillValid(this.access, player, MY_BLOCK.get());
}
```

### 데이터 동기화

몇몇 데이터는 클라이언트와 서버에 동시에 필요합니다. 메뉴는 현재 데이터가 마지막으로 클라이언트에 전송한 데이터와 일치하지 않을 때 동기화를 수행하는 기능을 제공합니다. 이 작업은 플레이어들에겐 틱마다 수행됩니다.

마인크래프트는 두 가지의 데이터 동기화를 제공하는데: `Slot`을 통한 `ItemStack` 동기화, 그리고 `DataSlot`을 통한 정수 동기화입니다. `Slot`과 `DataSlot`은 플레이어가 간접적으로 데이터에 접근하고 수정할 수 있는 통로를 제공합니다. `#addSlot`과 `#addDataSlot`을 호출해 메뉴에 추가할 수 있습니다.

:::note
`Slot`의 `Container`는 네오 포지의 [`IItemHandler` 캐패빌리티][cap]로 대체되었기 때문에, 이 문서는 `SlotItemHandler`를 사용한 동기화를 대신 다룹니다.
:::

`SlotItemHandler`는 네 가지 인자를 받는데: `Slot`을 담는 인벤토리를 대표하는 `IItemHandler`, 슬롯의 인덱스, 그리고 `AbstractContainerScreen#leftPos`랑 `#topPos` 기준 왼쪽 위 가장자리로부터 슬롯을 렌더링할 x, y 좌표입니다. 이때 클라이언트에선 크기가 동일한 빈 `IItemHandler`를 사용해야 합니다.

일반적으로, 메뉴 자체의 슬롯들이 먼저 추가되고, 그다음은 플레이어 인벤토리, 마지막으로 핫바가 추가됩니다. 메뉴의 개별적인 `Slot`에 접근하려면 해당 인덱스를 추가되는 순서에 따라 계산해야 합니다.

`DataSlot`은 외부 데이터에 대한 getter와 setter를 제공하는 추상 클래스입니다. 클라이언트에선 언제나 `DataSlot#standalone`을 사용해 새 인스턴스를 만들어야 합니다.

`DataSlot`, 그리고 `Slot`들은 메뉴가 초기화될 때마다 다시 생성됩니다.

:::caution
비록 `DataSlot`이 정수를 저장하긴 하나, 데이터 범위는 **short**(-32768~32767)로 제한됩니다. 네트워크로 값을 전송하는 방식 때문에 위 16비트는 무시됩니다.
:::

```java
// 외부에 5칸짜리 인벤토리가 있다고 가정함
// 서버에서 메뉴를 생성할 때마다 DataSlot이 각각 초기화된다고 가정함

// 클라이언트용 메뉴 생성자
public MyMenuAccess(int containerId, Inventory playerInventory) {
  this(containerId, playerInventory, new ItemStackHandler(5), DataSlot.standalone());
}

// 서버용 메뉴 생성자
public MyMenuAccess(int containerId, Inventory playerInventory, IItemHandler dataInventory, DataSlot dataSingle) {
  // 인벤토리 크기를 확인
  // 이후, IItemHandler용 Slot을 추가
  this.addSlot(new SlotItemHandler(dataInventory, /*...*/));

  // 플레이어 인벤토리 추가
  this.addSlot(new Slot(playerInventory, /*...*/));

  // 동기화되는 정수 추가
  this.addDataSlot(dataSingle);

  // ...
}
```

#### `ContainerData`

만약 정수 여러 개를 클라이언트와 동기화해야 한다면, `ContainerData`를 사용해 정수 배열처럼 다룰 수 있습니다. 이 인터페이스는 인덱스를 활용해 각기 다른 정수를 관리합니다. 만약 외부 데이터가 직접 `ContainerData`를 만든다면 `#addDataSlots`로 바로 메뉴에 추가할 수 있습니다. 이 메서드는 인터페이스가 가진 정수 개수만큼 `DataSlot`을 생성합니다. 클라이언트용 메뉴 생성자는 언제나 `SimpleContainerData`를 대신 사용해야 합니다.

```java
// 정수 세 개를 담는 ContainerData가 있다고 가정함

// 클라이언트용 메뉴 생성자
public MyMenuAccess(int containerId, Inventory playerInventory) {
  this(containerId, playerInventory, new SimpleContainerData(3));
}

// 서버용 메뉴 생성자
public MyMenuAccess(int containerId, Inventory playerInventory, ContainerData dataMultiple) {
  // ContainerData 크기 확인
  checkContainerDataCount(dataMultiple, 3);

  // 메뉴에 동기화된 정수 슬롯 추가
  this.addDataSlots(dataMultiple);

  // ...
}
```

:::caution
`ContainerData`도 내부적으론 `DataSlot`을 사용하기에, 이 또한 범위가 **short** (-32768 to 32767)로 제한됩니다.
:::

#### `#quickMoveStack`

`#quickMoveStack`은 메뉴가 구현해야 하는 두 번째 메서드 입니다. 이 메서드는 쉬프트 클릭, 또는 빠른 이동 등을 하면 호출됩니다. 이 메서드는 원본 슬롯에서 빼 올 아이템 스택의 복사본을 반환합니다.

슬롯 간 아이템 이동은 대개 `#moveItemStackTo`로 이루어집니다, 이 메서드는 사용 가능한 아무 첫 번째 슬롯으로 아이템을 이동시킵니다. 이 메서드는 이동시킬 아이템 스택, 시도할 첫번째 슬롯 인덱스(포함), 마지막 슬롯 인덱스(포함 안 됨), 그리고 역방향 순회 여부를 인자로 받습니다.

마인크래프트는 대개 다음과 같은 과정으로 아이템 이동을 처리합니다:

```java
// 슬롯 5개가 있는 "데이터 인벤토리"가 있다고 가정함
// 인덱스 1-4: 아이템 입력 칸
// 인덱스 0: 아이템 출력 칸
// 플레이어 인벤토리의 27 슬롯과 9개의 핫바 슬롯도 있음
// 인덱스 순서:
//   - 데이터 인벤토리: 결과 (0), 입력 (1 - 4)
//   - 플레이어 인벤토리 (5 - 31)
//   - 플레이어 핫바 (32 - 40)
@Override
public ItemStack quickMoveStack(Player player, int quickMovedSlotIndex) {
  // 빠른 이동으로 빼 올 아이템
  ItemStack quickMovedStack = ItemStack.EMPTY;
  // 빠른 이동으로 빼 올 슬롯
  Slot quickMovedSlot = this.slots.get(quickMovedSlotIndex) 
  
  // 만약 대상 슬롯이 존재하고 아이템이 들어있다면
  if (quickMovedSlot != null && quickMovedSlot.hasItem()) {
    // 빼 올 아이템 원본 가져오기
    ItemStack rawStack = quickMovedSlot.getItem(); 
    // 빼 올 아이템 복사하기
    quickMovedStack = rawStack.copy();

    /*
    아래 로직은 단순하게 설명하자면, 만약 아이템을 빼 올 슬롯이 데이터 인벤토리라면
    플레이어 인벤토리/핫바로 이동 시도. 그 반대의 경우도 마찬가지.
    */

    // 만약 아이템을 빼 올 슬롯이 데이터 인벤토리의 결과 슬롯이라면
    if (quickMovedSlotIndex == 0) {
      // 플레이어 인벤토리/핫바로 이동 시도하기
      if (!this.moveItemStackTo(rawStack, 5, 41, true)) {
        // 만약 이동 실패 시 취소
        return ItemStack.EMPTY;
      }

      // 빠른 이동 사용 시 수행할 작업 실행
      slot.onQuickCraft(rawStack, quickMovedStack);
    }
    // 아니라면 플레이어 인벤토리/핫바로부터 빼 오기
    else if (quickMovedSlotIndex >= 5 && quickMovedSlotIndex < 41) {
      // 인벤토리/핫바로부터 데이터 인벤토리 슬롯으로 아이템 이동 시도하기
      if (!this.moveItemStackTo(rawStack, 1, 5, false)) {
        // 실패 시 인벤토리 및 핫바 간 아이템 이동시키기
        // 만약 인벤토리에서 빼 오려 했다면
        if (quickMovedSlotIndex < 32) {
          // 핫바로 이동 시도
          if (!this.moveItemStackTo(rawStack, 32, 41, false)) {
            // 이마저도 실패하면 취소
            return ItemStack.EMPTY;
          }
        }
        // 아니면 핫바에서 인벤토리로 이동 시도
        else if (!this.moveItemStackTo(rawStack, 5, 32, false)) {
          // 이마저도 실패하면 취소
          return ItemStack.EMPTY;
        }
      }
    }
    // 아니라면 데이터 인벤토리의 입력 칸에서부터 아이템을 빼려고 시도하였음, 플레이어 인벤토리/핫바로 이동 시도
    else if (!this.moveItemStackTo(rawStack, 5, 41, false)) {
      // 이동 실패 시 취소
      return ItemStack.EMPTY;
    }

    if (rawStack.isEmpty()) {
      // 만약 원본 아이템 스택이 완전히 이동되었다면, 원본 슬롯 비우기
      quickMovedSlot.set(ItemStack.EMPTY);
    } else {
      // 아니라면 슬롯에 아이템 스택 개수가 변경되었다고 알리기
      quickMovedSlot.setChanged();
    }

    /*
    아래 코드는 상자와 같이 스스로 아이템을 변형하지 않는 경우엔 필요 없음.
    */
    if (rawStack.getCount() == quickMovedStack.getCount()) {
      // 만약 원본 아이템 스택이 조금이라도 변경되지 않았다면 취소
      return ItemStack.EMPTY;
    }
    // 아이템을 이동시킨 다음 남아있는 아이템으로 수행할 작업 실행
    quickMovedSlot.onTake(player, rawStack);
  }

  return quickMovedStack; // 빼 올 아이템 반환
}
```

## 메뉴 열기

메뉴 종류를 등록하셨고, 메뉴도 완성했으며, 메뉴 [스크린][screen]도 연결했다면, 이제 사용자에게 보여줄 준비가 되었습니다. 메뉴는 `NetworkHooks#openScreen`을 논리 서버에서 호출해 열 수 있습니다. 이 메서드는 메뉴를 열 플레이어, 서버에서 메뉴를 생성할 `MenuProvider`, 선택적으로 추가 데이터를 담아 보낼 버퍼 `FriendlyByteBuffer`를 인자로 받습니다.

:::note
`NetworkHooks#openScreen`에 `FriendlyByteBuf`를 넘기시려면 해당 메뉴의 종류는 무조건 [`IContainerFactory`][icf]로 생성되어야 합니다.
:::

#### `MenuProvider`

`MenuProvider`는 두 개의 메서드를 정의하는 인터페이스입니다: 서버에서 메뉴를 생성하는 `#createMenu`, [스크린][screen]에 사용할 메뉴의 제목 컴포넨트를 반환하는 `#getDisplayName`입니다. `#createMenu`는 세 개의 인자를 받는데: 메뉴의 컨테이너 id, 메뉴를 연 플레이어의 인벤토리, 메뉴를 연 플레이어입니다.

`MenuProvider`는 `SimpleMenuProvider`를 활용해 간단히 생성할 수 있는데, 서버 메뉴를 생성하는 메서드의 참조와 제목 컴포넨트를 인자로 넘기면 됩니다.

```java
NetworkHooks.openScreen(serverPlayer, new SimpleMenuProvider(
  (containerId, playerInventory, player) -> new MyMenu(containerId, playerInventory),
  Component.translatable("menu.title.examplemod.mymenu")
));
```

### 공통 기능들

메뉴는 대개 플레이어의 상호 작용으로 인해 열립니다(예: 블록 또는 엔티티 우클릭).

#### 블록에 적용하기

블록들은 대개 `BlockBehaviour#use`를 재정의해 메뉴를 엽니다. 논리 클라이언트에선 `InteractionResult#SUCCESS`를 반환해야 하고. 논리 서버에선 메뉴를 열고 `InteractionResult#CONSUME`을 반환하세요.


`MenuProvider`는 `BlockBehaviour#getMenuProvider`를 재정의해 제공해야 합니다. 바닐라 마인크래프트는 관전자 모드에서 메뉴를 열기 위해 이 메서드를 사용합니다.

```java
// 블록 하위 클래스
@Override
public MenuProvider getMenuProvider(BlockState state, Level level, BlockPos pos) {
  return new SimpleMenuProvider(/* ... */);
}

@Override
public InteractionResult use(BlockState state, Level level, BlockPos pos, Player player, InteractionHand hand, BlockHitResult result) {
  if (!level.isClientSide && player instanceof ServerPlayer serverPlayer) {
    NetworkHooks.openScreen(serverPlayer, state.getMenuProvider(level, pos));
  }
  return InteractionResult.sidedSuccess(level.isClientSide);
}
```

:::note
메뉴를 여는데 특정 조건을 적용하려면 먼저 필요한 데이터를 클라이언트와 동기화해야 하고, 클라이언트에서 조건 실패 시 `InteractionResult#PASS` 또는 `#FAIL`을 반환해야 합니다.
:::

#### 몹에 적용하기

몹은 대개 `Mob#mobInteract`를 재정의하여 메뉴 기능을 구현합니다. 이는 블록과 유사하며 유일한 차이는 관전자 모드를 지원하려면 `Mob` 자체가 `MenuProvider`를 구현해야 합니다.

```java
public class MyMob extends Mob implements MenuProvider {
  // ...

  @Override
  public InteractionResult mobInteract(Player player, InteractionHand hand) {
    if (!this.level.isClientSide && player instanceof ServerPlayer serverPlayer) {
      NetworkHooks.openScreen(serverPlayer, this);
    }
    return InteractionResult.sidedSuccess(this.level.isClientSide);
  }
}
```

[registered]: ../concepts/registries.md#객체-등록하기
[acm]: #abstractcontainermenu
[mt]: #menutype
[qms]: #quickmovestack
[cap]: ../datastorage/capabilities.md#네오-포지에서-제공하는-캐패빌리티
[screen]: ./screens.md
[icf]: #icontainerfactory
