접근 변환자
===================

접근 변환자 (AccessTransformer, AT라고 짧게 부르기도 합니다.)는 클래스, 메서드, 필드의 가시성을 확대시키거나, `final` 키워드 유무 여부를 변경하는데 사용됩니다. 이를 통하여 모드 개발자들이 접근 불가능한 클래스 멤버에 접근하고 사용할 수 있도록 해줍니다.

이에 관한 [공식 포지 문서][specs]를 마인크래프트 포지 깃헙 페이지에서 보실 수 있습니다.

AT 추가하기
----------

접근 변환자를 모드에서 사용하는 것은, `build.gradle`에 줄 하나 추가하는 것 만큼 간단합니다:

```groovy
// 이 블록은 매핑 채널과 버전을 지정하는 곳이기도 합니다.
minecraft {
    accessTransformer = file('src/main/resources/META-INF/accesstransformer.cfg')
}
```

접근 변환자를 추가하거나 수정하신 이후, Gradle 프로젝트를 새로고침 하셔야만 접근 변환자가 적용됩니다.

개발 도중에는 접근 제한자 설정 파일이 프로젝트 어디에나 위치하여도 상관 없으나, 모드를 개발 환경 밖에서 불러올 때에는 JAR 안의  `META-INF/accesstransformer.cfg`에 위치하여야만 정상적으로 불러올 수 있습니다.

주석
--------

`#`로 시작하는 줄은 주석으로 처리되며 무시됩니다.

접근 수정자
----------------

접근 수정자는 타겟이 가지게 될 새로운 가시성을 정의합니다. 가시성을 기준으로 위에서 아래로 정렬하면:

* `public` - 패키지 안, 또는 밖에 있는 모든 클래스에서 접근할 수 있음
* `protected` - 패키지 안에 있는 클래스, 또는 자식 클래스에서만 접근할 수 있음
* `default` - 패키지 내부에 있는 클래스에서만 접근할 수 있음
* `private` - 클래스 내부에서만 접근할 수 있음

`+f`와 `-f`는 특수한 수정자로, 기존의 다른 수정자에 추가될 수 있으며, 타겟의 `final` 키워드를 제거하거나 추가하여, 기존에는 불가능하던 자식 클래스 생성이나, 메서드 재정의, 또는 필드 값 변경 등을 가능하도록 해줍니다.

:::danger
메서드에 접근 변환자를 사용할 때, 직접적으로 가리키는 메서드만 변환됩니다; 해당 메서드를 재정의하는 메서드들에는 똑같은 가시성 수정이 이루어지지 않아, 자식 메서드가 부모 메서드보다 더 낮은 가시성을 가지게 가지게 되어 JVM 오류가 발생할 수 있으니, 가시성을 변경하고자 하는 메서드가 다른 곳에서 재정의되면 안됩니다!

`private` 메서드나 `final` 메서드(또는 `final` 클래스에 정의된 메서드), 그리고 `static` (정적) 메서드들은 재정의가 불가능합니다, 그렇기에 위와 같은 문제가 발생하지 않습니다.
:::

변환 타겟 지정하기
----------------------

:::caution
접근 변환자를 마인크래프트 클래스에 사용할때, 필드나 메서드 이름으로 SRG 이름을 사용하셔야 합니다.
:::

### 클래스

클래스를 지정하려면:

```
<접근 수정자> <완전한 클래스 이름>
```

내부 클래스들은, 외부 클래스의 완전한 이름과 내부 클래스의 이름을 `$`로 분리하여 표시합니다.

### 필드

필드를 지정하려면:

```
<접근 수정자> <완전한 클래스 이름> <필드 이름>
```

### 메서드

메서드를 지정하는 것은 특수한 문법을 통하여 메서드의 인자들과 반환 타입까지 표시합니다:

```
<접근 수정자> <완전한 클래스 이름> <메서드 이름>(<인자의 타입들>)<반환 타입>
```

#### 타입 지정하기

타입은 "descriptor"라고 불리기도 합니다.자세한 사항은  [Oracle 기술 문서에서 확인하세요(Java Virtual Machine Specification, SE 8, sections 4.3.2 and 4.3.3)][jvmdescriptors]

* `B` - `byte`, 부호가 있는 바이트
* `C` - `char`, UTF-16 유니코드 문자 번호
* `D` - `double`, 배정밀도 부동 소수점
* `F` - `float`, 단정밀도 부동 소수점
* `I` - `integer`, 32비트 정수
* `J` - `long`, 64비트 정수
* `S` - `short`, 부호가 있는 16비트 정수
* `Z` - `boolean`, `true` 또는 `false` 인 값
* `[` - 배열의 차원 1개를 표시함
  * 예: `[[S` 는 `short[][]`를 가리킵니다
* `L<class name>;` - 참조 타입을 참조함
  * 예: `Ljava/lang/String;` 는 참조 타입 `java.lang.String`를 가리킵니다 _(빗금 대신 마침표를 사용합니다)_
* `(` - 메서드 디스크립터를 참조합니다, 인자들은 있다면 이곳에서 기술되어야 합니다
  * 예: `<method>(I)Z` 는 인자로 Int 1개를 받고 Boolean을 반환하는 메서드를 가리킵니다
* `V` - 반환하는 값이 없는 메서드를 가리킵니다, 메서드 디스크립터 맨 뒤에 사용할 수 있습니다
  * 예: `<method>()V` 는 받는 인자가 없으며 반환하는 값도 없는 메서드를 가리킵니다

예제들
--------

```
# Crypt 클래스의 ByteArrayToKeyFunction 인터페이스의 가시성을 public으로 변경합니다.
public net.minecraft.util.Crypt$ByteArrayToKeyFunction

# MinecraftServer의 'random' 필드를 protected 로 만들고 final 키워드를 제거합니다
protected-f net.minecraft.server.MinecraftServer f_129758_ #random

# Util에 있는 String을 인자로 받고 ExecutorService를 반환하는,
# 'makeExecutor' 메서드를 public 으로 만듭니다
public net.minecraft.Util m_137477_(Ljava/lang/String;)Ljava/util/concurrent/ExecutorService; #makeExecutor

# UUIDUtil에 있는 2개의 long을 인자로 받고 int[]를 반환하는,
# 'leastMostToIntArray' 메서드를 public으로 만듭니다
public net.minecraft.core.UUIDUtil m_235872_(JJ)[I #leastMostToIntArray
```

[specs]: https://github.com/neoforged/AccessTransformers/blob/main/FMLAT.md
[jvmdescriptors]: https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.3.2
