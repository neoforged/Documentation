全局战利品修改器
===============

全局战利品修改器是一种数据驱动的方法，可以处理收割掉落的修改，而无需覆盖数十到数百个原版战利品表，也无需处理需要与另一个模组的战利品表交互的效果，而不知道可能加载了什么模组。全局战利品修改器也是堆叠的，而不是后来者为王，类似于标签。

注册一个全局战利品修改器
----------------------

你将需要4件事物：

1. 创建一个`global_loot_modifiers.json`。
    * 这将告诉Forge你的修改器以及类似于[tags][标签]的工作。
2. 代表修改器的序列化json。
    * 这将包含有关你修改的所有数据，并允许数据包调整你的效果。
3. 一个继承自`IGlobalLootModifier`的类。
    * 使修改器工作的操作代码。大多数模组开发者都可以继承`LootModifier`，因为它提供了基本功能。
4. 最后，使用编解码器对操作类进行编码和解码。
    * 其应像任何其他`IForgeRegistryEntry`一样被[注册][registered]。

`global_loot_modifiers.json`文件
--------------------------------

`global_loot_modifiers.json`表示要加载到游戏中的所有战利品修改器。此文件**必须**放在`data/forge/loot_modifiers/global_loot_modifiers.json`。

!!! 重要
    `global_loot_modifiers.json`只能在`forge`命名空间中被读取。如果该文件位于模组的命名空间下，则会被忽略。

`entries`是将要加载的修改器的*有序列表*。指定的[ResourceLocation][resloc]指向其在`data/<namespace>/loot_modifiers/<path>.json`中的关联条目。这主要与数据包生成器有关，用于解决独立模组的修改器之间的冲突。

`replace`，当`true`时，会将行为从向全局列表添加战利品修改器更改为完全替换全局列表条目。为了与其他模组实现兼容，模组开发者将希望使用`false`。数据包作者可能希望用`true`以指定其覆盖。

```js
{
  "replace": false, // 必须存在
  "entries": [
    // 代表'data/examplemod/loot_modifiers/example_glm.json'中的一个战利品修改器
    "examplemod:example_glm",
    "examplemod:example_glm2"
    // ...
  ]
}
```

序列化JSON
----------

该文件包含与修改器相关的所有潜在变量，包括修改任何战利品之前必须满足的条件。尽可能避免硬编码值，以便数据包作者可以根据需要调整平衡。

`type`表示用于读取关联JSON文件的[编解码器][codec]的注册表名称。这必须始终存在。

`conditions`应该表示该修改器要激活的战利品表条件。条件应该避免被硬编码，以允许数据包作者尽可能灵活地调整标准。这也必须始终存在。

!!! 重要
    尽管`conditions`应该表示修改器激活所需的内容，但只有在使用捆绑的Forge类时才会出现这种情况。如果使用`LootModifier`作为子类，则所有条件都将用**逻辑与（AND）**相连，并检查是否应应用修改器。

还可以指定由序列化器读取并由修改器定义的任何附加属性。

```js
// 在data/examplemod/loot_modifiers/example_glm.json内
{
  "type": "examplemod:example_loot_modifier",
  "conditions": [
    // 普通的战利品表条件
    // ...
  ],
  "prop1": "val1",
  "prop2": 10,
  "prop3": "minecraft:dirt"
}
```

`IGlobalLootModifier`
---------------------

要提供全局战利品修改器指定的功能，必须指定一个`IGlobalLootModifier`实现。这些是每次序列化器解码JSON中的信息并将其提供给该对象时生成的实例。

为了创建新的修改器，需要定义两种方法：`#apply`和`#codec`。`#apply`获取将与上下文信息一起生成的当前战利品，例如当前等级或额外定义的参数。它返回要生成的掉落物列表。

:::caution
    从任何一个修改器返回的掉落物列表都会按照它们注册的顺序输入到其他修改器中。因此，修改后的战利品可以被另一个战利品修改器修改。
:::

`#codec`返回已注册的[编解码器][codec]，用于将修改器编码到JSON或从JSON解码修改器。

### `LootModifier`子类

`LootModifier`是`IGlobalLootModifier`的一个抽象实现，用于提供大多数模组开发者可以轻松扩展和实现的基本功能。其通过定义`#apply`方法来检查条件，以确定是否修改生成的战利品，从而扩展了现有接口。

在子类实现中有两件事需要注意：构造函数必须接受`LootItemCondition`的一个数组和`#doApply`方法。

`LootItemCondition`的数组定义了在修改战利品之前必须为true的条件列表。所提供的条件是用**逻辑和（AND）**连在一起的，这意味着所有条件都必须为true。

`#doApply`方法的工作原理与`#apply`方法相同，只是它只在所有条件都返回true时执行。

```java
public class ExampleModifier extends LootModifier {

  public ExampleModifier(LootItemCondition[] conditionsIn, String prop1, int prop2, Item prop3) {
    super(conditionsIn);
    // 存储其余参数
  }

  @NotNull
  @Override
  protected ObjectArrayList<ItemStack> doApply(ObjectArrayList<ItemStack> generatedLoot, LootContext context) {
    // 修改战利品并返回新的掉落物
  }

  @Override
  public Codec<? extends IGlobalLootModifier> codec() {
    // 返回用于编码和解码此修改器的编解码器
  }
}
```

战利品修改器的编解码器
--------------------

JSON和`IGlobalLootModifier`实例之间的桥梁是[`Codec<T>`][codecdef]，其中`T`表示要使用的`IGlobalLootModifier`的具体类型。

为了方便起见，通过`LootModifier#codecStart`为类似记录的编解码器提供了一个战利品条件编解码器。这用于相关战利品修改器的[数据生成][datagen]。

```java
// 对于某个DeferredRegister<Codec<? extends IGlobalLootModifier>> REGISTRAR
public static final RegistryObject<Codec<ExampleModifier>> = REGISTRAR.register("example_codec", () ->
  RecordCodecBuilder.create(
    inst -> LootModifier.codecStart(inst).and(
      inst.group(
        Codec.STRING.fieldOf("prop1").forGetter(m -> m.prop1),
        Codec.INT.fieldOf("prop2").forGetter(m -> m.prop2),
        ForgeRegistries.ITEMS.getCodec().fieldOf("prop3").forGetter(m -> m.prop3)
      )
    ).apply(inst, ExampleModifier::new)
  )
);
```

[示例][examples]可以在Forge Git存储库中找到，包括精准采集和熔炼效果。

[tags]: ./tags.md
[resloc]: ../../concepts/resources.md#ResourceLocation
[codec]: #the-loot-modifier-codec
[registered]: ../../concepts/registries.md#methods-for-registering
[codecdef]: ../../datastorage/codecs.md
[datagen]: ../../datagen/server/glm.md
[examples]: https://github.com/MinecraftForge/MinecraftForge/blob/1.20.x/src/test/java/net/minecraftforge/debug/gameplay/loot/GlobalLootModifiersTest.java
