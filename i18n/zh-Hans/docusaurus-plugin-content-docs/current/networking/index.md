# 网络通信

服务器和客户端之间的通信是成功实现模组的基础。

网络通信有两个主要目标：

1. 确保客户端视图与服务器视图“同步”
    - 在坐标 (X, Y, Z) 处的花刚刚生长了
2. 让客户端告诉服务器有关玩家状态变化的信息
    - 玩家按下了一个键

实现这些目标最常见的方式是在客户端和服务器之间传递消息。这些消息通常会被结构化，按特定的排列方式包含数据，以便于发送和接收。

NeoForge 提供了一种技术来促进通信，主要建立在 [netty][] 之上。
通过监听 `RegisterPayloadHandlerEvent` 事件，可以注册特定类型的 [负载][payloads]、其读取器和处理函数到注册器中。

[netty]: https://netty.io "Netty Website"
[payloads]: ./payload.md "Registering custom Payloads"
