全局战利品修改器 (Global Loot Modifiers)
===========

全局战利品修改器是一种数据驱动的方法，用于处理收获物品的修改，无需覆盖数十到数百个原版战利品表，或处理可能需要与其他模组的战利品表互动而不知道哪些模组可能已加载的效果。全局战利品修改器也是叠加的，而不是最后加载胜出的方式，类似于标签。

注册全局战利品修改器
-------------------------------

您将需要做4件事：

1. 创建一个`global_loot_modifiers.json`。
    * 这将告诉Forge有关您的修改器，并且其工作方式类似于[标签]。
2. 表示您的修改器的序列化json。
    * 这将包含有关您的修改的所有数据，并允许数据包调整您的效果。
3. 一个扩展了`IGlobalLootModifier`的类。
    * 使您的修改器工作的操作代码。大多数模组开发者可以扩展`LootModifier`，因为它提供了基本功能。
4. 最后，一个编解码器来编码和解码您的操作类。
    * 这被[注册]为任何其他`IForgeRegistryEntry`。

`global_loot_modifiers.json`
-------------------------------

`global_loot_modifiers.json`代表要加载到游戏中的所有战利品修改器。这个文件**必须**被放置在`data/forge/loot_modifiers/global_loot_modifiers.json`内。

:::danger
`global_loot_modifiers.json`将只在`forge`命名空间下读取。如果文件位于模组的命名空间下，则会被忽略。
:::

`entries`是将要加载的修改器的*有序列表*。指定的[ResourceLocation][resloc]指向`data/<namespace>/loot_modifiers/<path>.json`内的相关条目。这主要与数据包制作者相关，用于解决来自不同模组的修改器之间的冲突。

`replace`为`true`时，会将从在全局列表中追加战利品修改器的行为改为完全替换全局列表条目。模组开发者会想使用`false`来与其他模组的实现兼容。数据包制作者可能会想使用`true`来指定他们的覆盖项。

```js
{
  "replace": false, // Must be present
  "entries": [
    // Represents a loot modifier in 'data/examplemod/loot_modifiers/example_glm.json'
    "examplemod:example_glm",
    "examplemod:example_glm2"
    // ...
  ]
}
```

序列化的JSON
-------------------------------

此文件包含与您的修改器相关的所有可能变量，包括在修改任何战利品之前必须满足的条件。应尽可能避免硬编码的值，以便数据包制作者可以在需要时调整平衡。

`type`代表用来读取关联的JSON文件的[编解码器]的注册名称。这必须始终存在。

`conditions`应该代表此修改器激活的战利品表条件。条件应尽量避免硬编码，以便数据包创建者可以尽可能灵活地调整条件。这也必须始终存在。

:::caution
虽然`conditions`应该代表激活修改器所需的条件，但只有在使用捆绑的Forge类时才是这种情况。如果使用`LootModifier`作为子类，所有的条件将被**并在一起**，并检查是否应该应用修改器。
:::

也可以指定由修改器定义并由序列化器读取的任何其他属性。

```js
// Within data/examplemod/loot_modifiers/example_glm.json
{
  "type": "examplemod:example_loot_modifier",
  "conditions": [
    // Normal loot table conditions
    // ...
  ],
  "prop1": "val1",
  "prop2": 10,
  "prop3": "minecraft:dirt"
}
```

`IGlobalLootModifier`
---------------------

为了提供全局战利品修改器指定的功能，必须指定一个`IGlobalLootModifier`的实现。这些是每次序列化器从JSON解码信息并将其提供到此对象时生成的实例。

为了创建一个新的修改器，需要定义两个方法：`#apply`和`#codec`。`#apply`接收将要生成的当前战利品以及上下文信息，如当前级别或额外定义的参数。它返回要生成的掉落物列表。

:::info
从任一修改器返回的掉落物列表将按照它们注册的顺序提供给其他修改器。因此，修改过的战利品可以被其他战利品修改器修改。
:::

`#codec`返回已注册的[编解码器]，用于将修改器编码并解码为JSON。

### `LootModifier`子类

`LootModifier`是`IGlobalLootModifier`的一个抽象实现，它提供了大多数模组开发者可以轻松扩展和实现的基本功能。这在现有的接口上进行了扩展，通过定义`#apply`方法来检查条件，以确定是否要修改生成的战利品。

在子类实现中有两件事需要注意：一个是必须接受一个`LootItemCondition`数组的构造器，另一个是`#doApply`方法。

`LootItemCondition`数组定义了在战利品可以被修改之前必须为真的条件列表。提供的条件将被**并在一起**，这意味着所有的条件都必须为真。

`#doApply`方法的工作方式与`#apply`方法相同，只是它只在所有条件返回真时才执行。

```java
public class ExampleModifier extends LootModifier {

  public ExampleModifier(LootItemCondition[] conditionsIn, String prop1, int prop2, Item prop3) {
    super(conditionsIn);
    // Store the rest of the parameters
  }

  @NotNull
  @Override
  protected ObjectArrayList<ItemStack> doApply(ObjectArrayList<ItemStack> generatedLoot, LootContext context) {
    // Modify the loot and return the new drops
  }

  @Override
  public Codec<? extends IGlobalLootModifier> codec() {
    // Return the codec used to encode and decode this modifier
  }
}
```

战利品修改器编解码器
-----------------------

将JSON与`IGlobalLootModifier`实例连接起来的是一个[`Codec<T>`][codecdef]，其中`T`代表要使用的`IGlobalLootModifier`的类型。

为了方便起见，已经提供了一个战利品条件编解码器，可以通过`LootModifier#codecStart`轻松地添加到类似记录的编解码器中。这用于关联战利品修改器的[数据生成][datagen]。

```java
// For some DeferredRegister<Codec<? extends IGlobalLootModifier>> REGISTRAR
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

[示例][examples]可以在Forge Git仓库中找到，包括精准采集和烧炼效果的示例。

[tags]: ./tags.md
[resloc]: ../../misc/resourcelocation.md
[codec]: #the-loot-modifier-codec
[registered]: ../../concepts/registries.md#methods-for-registering
[codecdef]: ../../datastorage/codecs.md
[datagen]: ../../datagen/server/glm.md
[examples]: https://github.com/neoforged/NeoForge/blob/1.20.x/tests/src/main/java/net/neoforged/neoforge/debug/loot/GlobalLootModifiersTest.java
