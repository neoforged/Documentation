注册表
======

注册是获取模组的对象（如物品、方块、音效等）并使其为游戏所知的过程。注册东西很重要，因为如果没有注册，游戏将根本不知道这些对象，这将导致无法解释的行为和崩溃。

游戏中的大多数注册相关事项都由Forge注册表处理。注册表是一个与为键分配值的Map的行为类似的对象。Forge使用带有[`ResourceLocation`][ResourceLocation]键的注册表来注册对象。这允许`ResourceLocation`充当对象的“注册表名称”。

每种类型的可注册对象都有自己的注册表。要查看由Forge封装的所有注册表，请参阅`ForgeRegistries`类。注册表中的所有注册表名称必须是唯一的。但是，不同注册表中的名称不会发生冲突。例如，有一个`Block`注册表和一个`Item`注册表。一个方块和一个物品可以用相同的名称`example:thing`注册而不冲突；但是，如果两个不同的方块（或物品）以相同的名称被注册，则第二个对象将覆盖第一个对象。

注册的方式
---------

有两种正确的方式来注册对象：`DeferredRegister`类和`RegisterEvent`生命周期事件。

### DeferredRegister

`DeferredRegister`是注册对象的推荐方式。它包容静态初始化的使用与便利，同时也避免与之相关的问题。它只需维护一系列的Supplier，并在`RegisterEvent`期间注册这些Supplier所提供的对象。（Supplier是Java 8加入的新语法。——译者注）

以下是一个模组注册一个自定义方块的案例：

```java
private static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(ForgeRegistries.BLOCKS, MODID);

public static final RegistryObject<Block> ROCK_BLOCK = BLOCKS.register("rock", () -> new Block(BlockBehaviour.Properties.of().mapColor(MapColor.STONE)));

public ExampleMod() {
  BLOCKS.register(FMLJavaModLoadingContext.get().getModEventBus());
}
```

### `RegisterEvent`

`RegisterEvent`是注册对象的第二种方式。在模组构造函数之后和加载configs之前，该[事件][event]会为每个注册表激发。对象通过调用`#register`并传入注册表键、注册表对象的名称和对象本身而得以注册。还有一个额外的`#register`重载，它接收一个已使用的助手来注册具有给定名称的对象。建议使用此方法以避免不必要的对象创建。

案例如下：（事件处理器已被注册到*模组事件总线*）

```java
@SubscribeEvent
public void register(RegisterEvent event) {
  event.register(ForgeRegistries.Keys.BLOCKS,
    helper -> {
      helper.register(new ResourceLocation(MODID, "example_block_1"), new Block(...));
      helper.register(new ResourceLocation(MODID, "example_block_2"), new Block(...));
      helper.register(new ResourceLocation(MODID, "example_block_3"), new Block(...));
      // ...
    }
  );
}
```

### 未被Forge封装的注册表

并非所有的注册表都由Forge封装。这些可以是静态注册表，如`LootItemConditionType`，使用起来是安全的。还有动态注册表，如`ConfiguredFeature`和其他一些世界生成注册表，它们通常以JSON表示。`DeferredRegister#create`有一个重载，允许模组开发者指定原版注册表所创建的`RegistryObject`的注册表键。注册表方法和模组事件总线的附加与其他`DeferredRegister`相同。

:::note
    动态注册表对象**只能**通过数据文件（如JSON）被注册。它们**不能**在代码中被注册。
:::

```java
private static final DeferredRegister<LootItemConditionType> REGISTER = DeferredRegister.create(Registries.LOOT_CONDITION_TYPE, "examplemod");

public static final RegistryObject<LootItemConditionType> EXAMPLE_LOOT_ITEM_CONDITION_TYPE = REGISTER.register("example_loot_item_condition_type", () -> new LootItemConditionType(...));
```

:::caution
    有些类无法自行注册。相反，`*Type`类被注册，并在前者的构造函数中被使用。例如，[`BlockEntity`][blockentity]具有`BlockEntityType`，`Entity`具有`EntityType`。这些`*Type`类是工厂，它们只是根据需要创建包含类型。
    
    这些工厂是通过使用它们的`*Type$Builder`类创建的。例如：（`REGISTER`指的是`DeferredRegister<BlockEntityType>`）
    ```java
    public static final RegistryObject<BlockEntityType<ExampleBlockEntity>> EXAMPLE_BLOCK_ENTITY = REGISTER.register(
      "example_block_entity", () -> BlockEntityType.Builder.of(ExampleBlockEntity::new, EXAMPLE_BLOCK.get()).build(null)
    );
    ```
:::

引用已注册的对象
---------------

已注册的对象在创建和注册时不应存储在字段中。每当为相应的注册表触发`RegisterEvent`时，它们应总是新创建并注册的。这是为了允许在未来版本的Forge中动态加载和卸载模组。

已注册的对象必须始终通过`RegistryObject`或带有`@ObjectHolder`的字段引用。

### 使用RegistryObjects

一旦注册对象可用，就可以使用`RegistryObjects`检索对这些对象的引用。`DeferredRegister`使用它们来返回对已注册对象的引用。在为其注册表触发`RegisterEvent`后，它们的引用以及带有`@ObjectHolder`注释的字段都将被更新。

要获取`RegistryObject`，请使用可注册对象的`IForgeRegistry`和一个`ResourceLocation`调用`RegistryObject#create`。亦可使用自定义注册表，方式是向其提供注册表名称。请将`RegistryObject`存储在一个`public static final`字段中，并在需要该已注册对象时调用`#get`。

使用`RegistryObject`的一个案例：

```java
public static final RegistryObject<Item> BOW = RegistryObject.create(new ResourceLocation("minecraft:bow"), ForgeRegistries.ITEMS);

// 假设'neomagicae:mana_type'是一个合法的注册表，且'neomagicae:coffeinum'是该注册表中一个合法的对象
public static final RegistryObject<ManaType> COFFEINUM = RegistryObject.create(new ResourceLocation("neomagicae", "coffeinum"), new ResourceLocation("neomagicae", "mana_type"), "neomagicae"); 
```

### 使用@ObjectHolder

通过使用`@ObjectHolder`注释类或字段，并提供足够的信息来构造`ResourceLocation`以标识特定注册表中的特定对象，可以将注册表中的已注册对象注入`public static`字段。

使用`@ObjectHolder`的规则如下：

* 若类被使用`@ObjectHolder`注释，则如果未明确定义，其值将是该类中所有字段的默认命名空间
* 若类被使用`@Mod`注释，则如果未明确定义，modid将是其中所有已注释字段的默认命名空间
* 若符合下列条件，该类中的一个字段将会被考虑注入：
  * 其至少包含修饰符`public static`;
  * 该**字段**被`@ObjectHolder`注释，并且：
    * name值已被显式指明；并且
    * registry name值已被显式指明
  * _如果某个字段没有相应的注册表（registry name）或名称（name），则会引发编译时异常。_
* _如果最终的`ResourceLocation`不完整或无效（路径中存在无效字符），则会引发异常。_
* 如果没有发生其他错误或异常，则该字段将被注入
* 如果以上所有规则都不适用，则不会采取任何操作（并且日志可能会输出一条信息）

被`@ObjectHolder`注释的字段会在`RegisterEvent`为其注册表激发之后注入其值，与`RegistryObjects`的引用的更新同时发生。

:::caution
    如果要注入对象时该对象不存在于注册表中，那么日志会记录一条调试信息，并且不会注入任何值。
:::

由于这些规则相当复杂，案例如下：

```java
class Holder {
  @ObjectHolder(registryName = "minecraft:enchantment", value = "minecraft:flame")
  public static final Enchantment flame = null;     // 注释存在。[public static]是必需的。[final]是可选的。
                                                    // Registry name已被显式指明："minecraft:enchantment"
                                                    // Resource location已被显式指明："minecraft:flame"
                                                    // 将注入：[Enchantment]注册表中的"minecraft:flame"

  public static final Biome ice_flat = null;        // 该字段无注释。
                                                    // 因此，该字段被忽略。

  @ObjectHolder("minecraft:creeper")
  public static Entity creeper = null;              // 注释存在。[public static]是必需的。
                                                    // 该字段未指明注册表。
                                                    // 因此，其将引发编译时异常。

  @ObjectHolder(registryName = "potion")
  public static final Potion levitation = null;     // 注释存在。[public static]是必需的。[final]是可选的。
                                                    // Registry name已被显式指明："minecraft:potion"
                                                    // Resource location未在该字段中指明
                                                    // 因此，其将引发编译时异常。
}
```

创建自定义的Forge注册表
----------------------

自定义注册表通常只是一个简单的键值映射。这是一种常见的风格；然而，它强制对存在的注册表进行严格的依赖。它还要求任何需要在端位之间同步的数据都必须手动完成。自定义Forge注册表为创建软依赖项提供了一个简单的替代方案，同时提供了更好的管理手段和端位之间的自动同步（除非另有说明）。由于这些对象也使用Forge注册表，注册也以同样的方式标准化。

自定义Forge注册表是在`RegistryBuilder`的帮助下通过`NewRegistryEvent`或`DeferredRegister`创建的。`RegistryBuilder`类接受多种参数（例如注册表的名称、id范围以及注册表上发生的不同事件的各种回调）。`NewRegistryEvent`完成激发后，新的注册表将被注册到`RegistryManager`。

任何新创建的注册表都应该使用其关联的[注册方法][registration]来注册关联的对象。

### 使用NewRegistryEvent

使用`NewRegistryEvent`时，用`RegistryBuilder`调用`#create`将返回一个用Supplier包装的注册表。`NewRegistryEvent`在模组事件总线处理完毕后，这个Supplier注册表就可以访问了。在`NewRegistryEvent`被处理完毕之前试图从Supplier获取该自定义注册表将得到`null`值。

#### 新的数据包注册表

可以使用模组事件总线上的`DataPackRegistryEvent$NewRegistry`事件添加新的数据包注册表。注册表是通过`#dataPackRegistry`创建的，方法是传入表示注册表名称的`ResourceKey`和用于对JSON中的数据进行编码和解码的`Codec`。可以提供可选的`Codec`来将数据包注册表同步到客户端。

:::note
    数据包注册表不能用`DeferredRegister`创建。它们只能通过这个事件创建。
:::

### 使用DeferredRegister

`DeferredRegister`方法又是上述事件的另一个包装。一旦使用`#create`重载在常量字段中创建了`DeferredRegister`（该重载接受注册表名称和mod id），就可以通过`DeferredRegistry#makeRegistry`构建注册表。该方法接受了由Supplier提供的包含任何其他配置的`RegistryBuilder`。默认情况下，该方法已调用`#setName`。由于此方法可以在任何时候返回，因此会返回由Supplier提供的`IForgeRegistry`版本。在激发NewRegistryEvent之前试图从Supplier获取自定义注册表将得到`null`值。

:::note
    在通过`#register`将`DeferredRegister`添加到模组事件总线之前，必须调用`DeferredRegister#makeRegistry`。`#makeRegistry`也使用`#register`方法在`NewRegistryEvent`期间创建注册表。
:::

处理缺失的注册表条目
------------------

在某些情况下，每当更新模组或删除模组（更可能的情况）时，某些注册表对象将不复存在。可以通过第三个注册表事件指定操作来处理丢失的映射：`MissingMappingsEvent`。在该事件中，既可以通过给定注册表项和mod id的`#getMappings`获取丢失映射的列表，也可以通过给定注册项的`#getAllMappings`获取所有映射。

:::note
    `MissingMappingsEvent`在**Forge**事件总线上触发。
:::

对于每个映射（`Mapping`），可以选择四种映射类型之一来处理丢失的条目：

| 操作   | 描述        |
| :---:  |     :---    |
| IGNORE | 忽略丢失的条目并丢弃映射。 |
|  WARN  | 在日志中生成警告。 |
|  FAIL  | 阻止世界加载。 |
| REMAP  | 将条目重新映射到已注册的非null对象。 |

如果未指定任何操作，则默认操作为通过通知用户丢失的条目以及用户是否仍要加载世界。除了重新映射之外的所有操作都将防止任何其他注册表对象取代现有id，以防止相关条目被添加回游戏中。

[ResourceLocation]: ./resources.md#resourcelocation
[registration]: #methods-for-registering
[event]: ./events.md
[blockentity]: ../blockentities/index.md
