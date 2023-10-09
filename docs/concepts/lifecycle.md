모드 생명주기
==============

모드를 불러오는 과정은 생명주기라고 하는 여러 단계로 나눌 수 있습니다. 생명주기는 [객체 등록][등록], [데이터 생성 준비][데이터생성], 또는 [다른 모드와의 통신][모드통신] 등으로 나뉘며, 각 생명주기 단계는 모드별 버스에 이벤트를 방송합니다. 

:::caution
몇몇 생명주기 이벤트들은 병렬적으로 방송됩니다; 모드들이 여러 스레드에서 동시에 반응할 수 있습니다.

이러한 이벤트들은 `ParallelDispatchEvent`의 하위 클래스이며, 잘못하면 경쟁 상태를 유발할 수 있기 때문에 다른 모드의 API 또는 마인크래프트 시스템에 접근하는 코드는 `ParallelDispatchEvent#enqueueWork`를 이용해 메인 스레드에서 실행하세요.
:::

레지스트리 이벤트
---------------

레지스트리 이벤트들은 모드 메인 클래스 초기화 이후 방송됩니다. 이 이벤트들의 종류는 `NewRegistryEvent`, `DataPackRegistryEvent$NewRegistry`, 그리고 `RegistryEvent`가 있습니다.

`NewRegistryEvent`는 `RegistryBuilder`를 사용해 직접 레지스트리를 만들고 등록할 수 있도록 해줍니다.

`DataPackRegistryEvent$NewRegistry`는 JSON으로부터 레지스트리 객체를 읽고 쓸 `Codec`을 정의해 새로운 데이터팩 레지스트리를 생성합니다.

`RegistryEvent`는 [객체들을 레지스트리에 등록할 때][등록] 사용합니다. 이 이벤트는 각 레지스트리당 방송됩니다.

데이터 생성
---------------

만약 게임이 [데이터 생성 모드][데이터생성]로 실행되었다면, `GatherDataEvent`가 가장 마지막에 방송됩니다. 이 이벤트는 모드들의 데이터 제공자를 등록할때 사용합니다.

공통 초기화
------------

`FMLCommonSetupEvent`를 사용하여 게임을 불러올 때 사이드 상관 없이 실행할 코드를 작성할 수 있습니다. 그 예로 [캐패빌리티] 등록이 있습니다.

사이드 초기화
-----------

사이드 초기화 이벤트는 알맞는 [물리 사이드][사이드]에서만 방송되는 이벤트 입니다: `FMLClientSetupEvent`는 물리 클라이언트에서, `FMLDedicatedServerSetupEvent`는 전용 서버에서만 방송됩니다. 이 이벤트를 사용하여 키바인드 등록과 같은 사이드 전용 초기화를 진행할 수 있습니다.

InterModComms
-------------

이 단계에서는 모드끼리 메세지를 보내 통신하여 서로 연동할 수 있도록 합니다. 이때 방송되는 이벤트는 `InterModEnqueueEvent`와 `InterModProcessEvent`가 있습니다.

메세지는 `IMCMessage`로 표현되는데, 이는 메세지의 송신자와 수신자의 모드 아이디, 메세지의 데이터, 마지막으로 데이터의 키를 담고 있습니다.

`InterModEnqueueEvent`는 메세지를 보내는 이벤트로, `InterModComms#sendTo`를 사용해 다른 모드에 메세지를 전송할 수 있습니다. 이 메서드는 메세지를 받을 모드의 아이디, 메세지들을 구분하기 위한 키, 메세지의 데이터를 공급하는 `Supplier`를 인자로 받습니다. 추가적으로 메세지 송신자를 지정할 수도 있으나, 기본값으로는 메세지를 보내는 모드의 아이디 입니다.

`InterModProcessEvent`는 메세지를 받고 처리하는 이벤트로, `InterModComms#getMessages`를 사용해 모든 메세지들을 받을 수 있습니다. 이 메서드는 모드 아이디를 인자로 받는데 현재 모드의 아이디를 넘기시면 됩니다. 추가적으로 `Predicate`를 전달하여 몇몇 메세지만 필터링 할 수도 있습니다.

이때 보내진 메세지들은 `InterModComms`가 `ConcurrentMap`에 저장하는데, 메인 스레드 외 다른 스레드에서 사용하셔도 경쟁 상태를 유발하지 않아 안전합니다.

:::tip
그외에도 모드 메인 클래스 초기화 직후 레지스트리 이벤트보다 먼저 방송되는 `FMLConstructModEvent`, 그리고 `InterModComms` 이후 모드를 완전히 불러왔음을 알리는 `FMLLoadCompleteEvent` 생명주기 이벤트가 있습니다.
:::

[등록]: ./registries.md#객체-등록하기
[캐패빌리티]: ../datastorage/capabilities.md
[데이터생성]: ../datagen/index.md
[모드통신]: ./lifecycle.md#intermodcomms
[사이드]: ./sides.md
