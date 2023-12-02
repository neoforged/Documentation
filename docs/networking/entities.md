엔티티 통신
========

네트워크 메시지로 통신하는 것 말고도 엔티티의 데이터를 동기화시켜주는 시스템은 다양합니다.

스폰 데이터
----------

모드에서 추가하는 엔티티의 스폰 패킷에 데이터를 추가하거나, 상속하는 바닐라 엔티티의 자체적인 스폰 패킷을 변경하는 등 스폰 패킷을 수정하려면 `Entity#getAddEntityPacket`를 아래와 같이 재정의해 스폰 패킷을 포지에서 관리하도록 하는 것이 일반적입니다. 
```java
@Override
public Packet<ClientGamePacketListener> getAddEntityPacket()
{
    return NetworkHooks.getEntitySpawningPacket(this/* 엔티티의 인스턴스*/);
}
```

이후 다음 인터페이스를 사용하여 스폰 패킷에 추가 데이터를 실을 수 있습니다.

### IEntityAdditionalSpawnData

만약 엔티티가 클라이언트에 시간에 따라 변하진 않는 데이터를 전송해야 한다면 이 인터페이스를 사용하여 스폰 패킷에 담아 보내는 것이 권장됩니다. `#writeSpawnData`와 `#readSpawnData`를 재정의하여 스폰 패킷의 버퍼에서 데이터를 읽고 쓸 수 있습니다.

동적인 데이터
------------

### 데이터 파라미터

데이터 파라미터는 마인크래프트가 자동으로 엔티티의 데이터를 동기화 시킬때 주로 사용하는 시스템입니다. 바닐라 코드에서 사용법을 참고하실 수 있습니다.

먼저, 동기화할 데이터를 담는 `EntityDataAccessor<T>`가 필요합니다. 이 객체는 엔티티의 `static final` 필드에 할당하세요. `SynchedEntityData#defineId`에 엔티티의 클래스와 데이터를 직렬화할 `EntityDataSerializer`를 전달하여 생성할 수 있습니다. `EntityDataSerializers`에서 사전 정의된 `EntityDataSerializer`들을 찾아보실 수 있습니다. 

:::caution
데이터 파라미터는 __무조건__ 직접 만드시는 엔티티에만, __그 엔티티 클래스 안에서만__ 사용하셔야 합니다. 다른 엔티티에 파라미터를 추가하시면 그 데이터를 보낼때 사용하는 ID의 동기화를 깨버릴 수 있으며 고치기 어려운 문제를 유발할 수 있습니다.
:::

그 다음 `Entity#defineSynchedData`를 재정의해 `this.entityData.define(...)`을 각각의 `EntityDataAccessor`와 기본값을 전달하여 호출하세요. 늘 `super` 메서드를 먼저 호출하시는 것을 잊지 마세요!

그다음에는 엔티티의 `entityData` 인스턴스를 통해 데이터 파라미터의 값을 변경하고 읽으실 수 있습니다. 클라이언트에는 변경사항이 자동으로 보내집니다.
