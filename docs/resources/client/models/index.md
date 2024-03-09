모델
======

[모델 시스템][models]은 리소스팩을 통해 블록과 아이템에 모양을 추가합니다. 모델 시스템의 기능 중 하나는 블록과 아이템의 텍스쳐뿐 아니라 전체 모양까지 리소스팩으로 다루는 것이기에, 아이템 및 블록을 추가하는 모드들은 자체적으로 작은 리소스팩을 포함합니다. 

모델 파일
-----------

모델과 텍스쳐는 [`ResourceLocation`][resloc]으로 연결되지만, 이들을 저장하는 `ModelManager`는 `ModelResourceLocation`을 대신 사용합니다. `ModelResourceLocation`은 리소스 이름뿐 아니라 구체적인 모델의 변형(variant)도 지정하여 맥락에 따라 다른 모양을 사용합니다. 블록은 자신의 레지스트리 이름과 현재 [`BlockState`][state]를 문자열로 변환한 것을 변형으로 사용합니다. 아이템은 단순히 `inventory`를 사용합니다.

:::note
JSON 모델은 오직 직육면체만 지원합니다; 다른 모양도 사용하시려면 다른 포맷을 사용해야 합니다.
:::

### 텍스쳐

모델과 유사하게 텍스쳐도 리소스팩에 동봉되며 [`ResourceLocation`][resloc]으로 참조됩니다. 마인크래프트의 [UV 좌표][uv]의 원점(0, 0)은 **왼쪽 위** 가장자리입니다. UV의 범위는 **언제나** 0에서부터 16이며 더 크거나 작은 텍스쳐는 좌표의 크기를 조정해 맞춥니다. 밉맵이 잘못 적용될 수 있기 때문에 모든 텍스쳐는 정사각형이어야 하고, 각 변의 길이는 2의 제곱수여야 합니다. (예를 들어, 1x1, 2x2, 8x8, 16x16 등의 크기가 권장되며, 5x5, 30x30은 2의 제곱수가 아니기에 권장되지 않습니다. 5x10이나 4x8은 정사각형이 아니기에 깨질 수 있습니다.). 텍스쳐는 오직 [애니메이션][animated]을 추가할 때만 비 정사각형 형태일 수 있습니다. 

[models]: https://minecraft.wiki/w/Tutorials/Models#File_path
[resloc]: ../../../misc/resourcelocation.md
[statemodel]: https://minecraft.wiki/w/Tutorials/Models#Block_states
[itemmodels]: https://minecraft.wiki/w/Tutorials/Models#Item_models
[state]: ../../../blocks/states.md
[uv]: https://ko.wikipedia.org/wiki/UV_%EB%A7%A4%ED%95%91
[animated]: https://minecraft.wiki/w/Resource_Pack?so=search#Animation
