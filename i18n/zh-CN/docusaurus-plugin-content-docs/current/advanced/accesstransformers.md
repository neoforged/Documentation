访问转换器
=========

访问转换器（简称AT）允许扩大可见性并修改类、方法和字段的`final`标志。它们允许模组开发者访问和修改其控制之外的类中不可访问的成员。

[规范文档][specs]可以在Minecraft Forge GitHub上查看。

添加AT
------

在你的模组项目中添加一个访问转换器就像在`build.gradle`中添加一行一样简单：

```groovy
// 此代码块也是指定映射版本的位置
minecraft {
  accessTransformer = file('src/main/resources/META-INF/accesstransformer.cfg')
}
```

添加或修改访问转换器后，必须刷新Gradle项目才能使转换生效。

在开发过程中，AT文件可以位于上面一行指定的任何位置。然而，当在非开发环境中加载时，Forge只会在JAR文件中搜索`META-INF/accesstransformer.cfg`的确切路径。

注释
----

`#`之后直到行尾的所有文本都将被视为注释，不会被解析。

访问修饰符
---------

访问修饰符指定给定目标将转换为什么样的新成员可见性。按可见性降序：

* `public` - 对其包内外的所有类可见
* `protected` - 仅对包内和子类中的类可见
* `default` - 仅对包内的类可见
* `private` - 仅对类内部可见

一个特殊的修饰符`+f`和`-f`可以附加到前面提到的修饰符中，以分别添加或删除`final`修饰符，这可以在应用时防止子类化、方法重写或字段修改。

!!! 警告
    指令只修改它们直接引用的方法；任何重写方法都不会进行访问转换。建议确保转换后的方法没有限制可见性的未转换重写，这将导致JVM抛出错误（Error）。
    
    可以安全转换的方法示例有`private`方法、`final`方法（或`final`类中的方法）和`static`方法。

目标和指令
---------

!!! 重要
    在Minecraft类上使用访问转换器时，字段和方法必须使用SRG名称。

### 类
转换为目标类：
```
<access modifier> <fully qualified class name>
```
内部类是通过将外部类的完全限定名称和内部类的名称与分隔符`$`组合来表示的。

### 字段
转换为目标字段：
```
<access modifier> <fully qualified class name> <field name>
```

### 方法
目标方法需要一种特殊的语法来表示方法参数和返回类型：
```
<access modifier> <fully qualified class name> <method name>(<parameter types>)<return type>
```

#### 指定类型

也称为“描述符”：有关更多技术细节，请参阅[Java虚拟机规范，SE 8，第4.3.2和4.3.3节][jvmdescriptors]。

* `B` - `byte`，有符号字节
* `C` - `char`，UTF-16 Unicode字符
* `D` - `double`，双精度浮点值
* `F` - `float`，单精度浮点值
* `I` - `integer`，32位整数
* `J` - `long`，64位整数
* `S` - `short`，有符号short
* `Z` - `boolean`，`true`或`false`值
* `[` - 代表数组的一个维度
  * 例如：`[[S`指`short[][]`
* `L<class name>;` - 代表一个引用类型
  * 例如：`Ljava/lang/String;`指`java.lang.String`引用类型 _（注意左斜杠的使用而非句点）_
* `(` - 代表方法描述符，应在此处提供参数，如果不存在参数，则不提供任何参数
  * 例如：`<method>(I)Z`指的是一个需要整数参数并返回布尔值的方法
* `V` - 指示方法不返回值，只能在方法描述符的末尾使用
  * 例如：`<method>()V`指的是一个没有参数且不返回任何值的方法

示例
----

```
# 将Crypt中的ByteArrayToKeyFunction接口转换为public
public net.minecraft.util.Crypt$ByteArrayToKeyFunction

# 将MinecraftServer中的'random'转换为protected并移除final修饰符
protected-f net.minecraft.server.MinecraftServer f_129758_ #random

# 将Util中的'makeExecutor'方法转换为public，
# 接受一个String并返回一个ExecutorService
public net.minecraft.Util m_137477_(Ljava/lang/String;)Ljava/util/concurrent/ExecutorService; #makeExecutor

# 将UUIDUtil中的'leastMostToIntArray'方法转换为public
# 接受两个long参数并返回一个int[]
public net.minecraft.core.UUIDUtil m_235872_(JJ)[I #leastMostToIntArray
```

[specs]: https://github.com/MinecraftForge/AccessTransformers/blob/master/FMLAT.md
[jvmdescriptors]: https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.3.2
