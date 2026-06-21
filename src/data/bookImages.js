// ============================================
// 书籍图片映射数据
// 为每个知识点关联对应书籍章节的插图
// ============================================

// 资源基础路径：本地开发为 '/'，部署到 GitHub Pages 时为 '/dl-handbook/'
// 用 import.meta.env.BASE_URL 自动适配，避免子路径部署时图片 404
const BASE = import.meta.env.BASE_URL
// 拼接 public 目录下图片的绝对路径
const img = (p) => `${BASE}images/${p}`

// 图片映射：知识点 ID → 图片数组
// 每张图片包含路径和图注
export const bookImages = {
  // --- Book 1：深度学习入门 基于Python的理论与实现 ---
  'perceptron': [
    { src: img('book1/perceptron_1.jpg'), caption: '多层感知机由输入层、隐藏层和输出层组成，数据从输入层逐层向前传递，每层的神经元通过权重和激活函数处理信号，最终在输出层得到预测结果。理解此图是掌握深度学习的基础。' },
    { src: img('book1/perceptron_2.jpg'), caption: '通过组合与非门构建 XOR 网络：单层感知机无法解决异或问题，但用多个与非门组成两层网络即可实现，展示了多层网络相比单层的强大表达能力。' }
  ],
  'neural-network': [
    { src: img('book1/neural-network_1.jpg'), caption: '典型的三层神经网络：输入层接收特征数据，中间层（隐藏层）通过权重加权求和并激活来提取特征，输出层给出最终预测。层与层之间全连接，每条线代表一个可学习的权重参数。' },
    { src: img('book1/neural-network_2.jpg'), caption: '标注了具体权重数值的三层神经网络。每个连接上的数字表示权重，每个神经元内执行加权求和后通过激活函数。帮助理解网络前向计算的数学本质。' }
  ],
  'backpropagation': [
    { src: img('book1/backpropagation_1.jpg'), caption: '以购买苹果为例的计算图：展示了从苹果数量和单价出发的前向传播（算总价），以及从总价出发的反向传播（求各变量的梯度），直观理解链式法则如何在复杂计算中传递梯度。' },
    { src: img('book1/backpropagation_2.jpg'), caption: '加法节点的反向传播规则：上游梯度原封不动地传递给所有分支。这与乘法节点不同（乘法节点要乘以另一输入的值），是理解反向传播中不同类型节点梯度计算的关键。' }
  ],
  'training': [
    { src: img('book1/training_1.jpg'), caption: 'MNIST 手写数字数据集的样本展示，每张图片是 28x28 像素的灰度图。体现了数据驱动的方法：不再手工设计规则，而是让机器从大量标注数据中自动学习识别规律。' },
    { src: img('book1/training_2.jpg'), caption: '三种图像识别思路的对比：人工设计算法、基于特征工程的传统方法、以及端到端的神经网络方法。突出了神经网络的优势——自动学习特征，无需人工干预。' }
  ],
  'cnn': [
    { src: img('book1/cnn_1.jpg'), caption: '神经网络的层级构建方式：Affine 层做线性变换（矩阵乘法加偏置），ReLU 层做非线性激活，两者交替堆叠构成网络主体。这是理解 CNN 前向传播流程的基础模块。' },
    { src: img('book1/cnn_2.jpg'), caption: 'Softmax 函数的详细计算步骤：先对输出值做指数运算（防止溢出要减去最大值），再除以指数之和进行归一化，将网络输出转化为概率分布，使所有类别概率之和为 1。' }
  ],
  'mnist': [
    { src: img('book1/mnist_1.jpg'), caption: 'MNIST 手写数字 0-9 的标准样本图片，每类有多张不同手写风格的图片。这是深度学习最经典的入门数据集，理解数据的形态有助于把握分类任务的本质。' },
    { src: img('book1/mnist_2.jpg'), caption: '批处理的矩阵运算流程：多张图片打包成矩阵 X，依次与各层权重矩阵 W1、W2、W3 相乘，最终输出预测结果 Y。批处理利用矩阵运算提速，是实际训练中的标准做法。' }
  ],

  // --- Book 2：深度学习入门2 自制框架 ---
  'computation-graph': [
    { src: img('book2/computation-graph_1.jpg'), caption: 'sin 函数的泰勒展开用计算图表示：将多项式的加法、乘法和幂运算拆解为一个个节点，每个节点只做简单运算。展示了计算图如何将复杂函数分解为可自动求导的基本操作。' },
    { src: img('book2/computation-graph_2.jpg'), caption: 'y=sin(x) 的正向传播计算函数值，反向传播沿计算图逆向传递梯度 dy/dx=cos(x)。直观展示了自动微分的核心原理：正向算值，反向算梯度，每个节点只需局部求导。' }
  ],
  'autograd': [
    { src: img('book2/autograd_1.jpg'), caption: '对一次反向传播的结果再次求导，会自动创建新的计算图来追踪高阶导数的计算过程。这是自动微分框架的强大之处——可以无限阶求导，支持 Hessian 矩阵等高级优化。' },
    { src: img('book2/autograd_2.jpg'), caption: '自定义 Sin 类的正向传播计算 sin(x) 值，反向传播则计算 cos(x) 作为梯度。展示了如何用 Python 类封装运算，实现可复用的自定义函数节点，这是构建自定义框架的基础。' }
  ],
  'layers': [
    { src: img('book2/layers_1.jpg'), caption: 'Layer 基类的设计：包含 Parameter（可学习参数）和子 Layer 的嵌套结构。通过递归组合可以构建任意复杂的网络，这种面向对象的设计是 PyTorch 等框架的核心架构思想。' },
    { src: img('book2/layers_2.jpg'), caption: 'TwoLayerNet 由两个 Linear 层和一个 Sigmoid 激活函数组成，图中展示了完整的计算图连接。帮助理解如何用自定义框架像搭积木一样组合层来构建实用的神经网络模型。' }
  ],
  'optimizer': [
    { src: img('book2/optimizer_1.jpg'), caption: '不同学习率下梯度下降法的更新路径对比：学习率过大会震荡发散，过小则收敛缓慢，合适的学习率能平稳快速地到达损失函数的最小值点。' },
    { src: img('book2/optimizer_2.jpg'), caption: '优化器类的继承架构：SGD 作为基类，AdaGrad、Adam 等高级优化器继承并扩展。每种优化器用不同策略更新参数，了解它们的层次关系有助于选择合适的优化算法。' }
  ],

  // --- Book 3：深度学习进阶 自然语言处理 ---
  'word2vec': [
    { src: img('book3/word2vec_1.jpg'), caption: 'CBOW 模型用周围的上下文词来预测中心词。输入是上下文词的词向量，经过求和得到隐藏层，再通过 Softmax 输出词表概率分布。这是 Word2Vec 的经典架构之一。' },
    { src: img('book3/word2vec_2.jpg'), caption: 'Skip-gram 模型与 CBOW 相反：用中心词来预测周围的上下文词。输入一个中心词，输出多个上下文词的概率分布，适合处理低频词，训练得到的词向量语义质量更高。' }
  ],
  'rnn': [
    { src: img('book3/rnn_1.jpg'), caption: 'RNN 的循环结构：隐藏状态 h_t 不仅接收当前输入 x_t，还接收上一时刻的隐藏状态 h_{t-1}，形成信息记忆的回路。这是 RNN 能处理序列数据的核心机制。' },
    { src: img('book3/rnn_2.jpg'), caption: '将 RNN 沿时间轴展开后的示意图：每个时间步共享相同的权重参数，信息像链条一样从前往后传递。展开视角便于理解 BPTT（时间反向传播）算法如何跨时间步传递梯度。' }
  ],
  'lstm': [
    { src: img('book3/lstm_1.jpg'), caption: 'LSTM 的三个门控结构：遗忘门决定丢弃旧信息，输入门决定写入新信息，输出门决定当前输出。通过门控机制解决普通 RNN 的梯度消失问题，实现长距离依赖建模。' },
    { src: img('book3/lstm_2.jpg'), caption: 'LSTM 中细胞状态 C 和隐藏状态 h 的数据流向：细胞状态是信息高速公路，梯度可以沿此无损传递；隐藏状态则是对外输出。理解两条数据通路是掌握 LSTM 工作原理的关键。' }
  ],
  'seq2seq': [
    { src: img('book3/seq2seq_1.jpg'), caption: 'Seq2Seq 编码器-解码器架构：编码器将输入序列压缩成固定长度的上下文向量，解码器根据该向量逐步生成输出序列。这是机器翻译等序列到序列任务的基础框架。' },
    { src: img('book3/seq2seq_2.jpg'), caption: '序列到序列翻译的实际流程：编码器逐词读入源语言句子，解码器逐词输出目标语言翻译，每个解码步骤都依赖前一步的输出。展示了自回归生成的工作方式。' }
  ],
  'attention': [
    { src: img('book3/attention_1.jpg'), caption: '注意力权重的计算过程：通过解码器当前状态与编码器各位置的相似度打分，经 Softmax 归一化得到权重，再对编码器输出加权求和。让模型能聚焦于输入中最相关的部分。' },
    { src: img('book3/attention_2.jpg'), caption: 'Self-Attention 的核心计算：输入序列分别乘以三个权重矩阵生成 Q（查询）、K（键）、V（值），Q 和 K 做点积得到注意力分数，再与 V 加权求和。这是 Transformer 的基石。' }
  ],

  // --- Book 4：深度学习入门4 强化学习 ---
  'rl-basics': [
    { src: img('book4/rl-basics_1.jpg'), caption: '两种强化学习网络设计：左图同时输入状态和行动来预测 Q 值，右图仅输入状态就输出所有行动的 Q 值。后者更高效，是 DQN 采用的架构，一次前向传播即可比较所有行动。' },
    { src: img('book4/rl-basics_2.jpg'), caption: '监督学习的训练流程：给定输入和正确标签，通过前向计算预测值、计算损失、反向传播梯度来更新参数。与强化学习对比，帮助理解 RL 中没有明确标签、需要探索的特点。' }
  ],
  'mdp': [
    { src: img('book4/mdp_1.jpg'), caption: '经验回放机制：智能体将与环境交互产生的状态转移数据存入缓冲区，训练时随机采样小批量数据来更新网络。打破了数据间的时间相关性，大幅提升了 DQN 训练的稳定性。' },
    { src: img('book4/mdp_2.jpg'), caption: '将经验回放缓冲区中的小批量元素转换为 NumPy 数组的批处理结构，便于一次性送入神经网络进行并行计算。这是从逐条数据处理到批处理的工程实现细节。' }
  ],
  'q-learning': [
    { src: img('book4/q-learning_1.jpg'), caption: 'Q 学习在网格世界中训练完成后得到的 Q 函数可视化，每个状态-行动对都有一个 Q 值，贪婪策略选择 Q 值最大的行动。直观展示了 Q 值如何编码最优行为策略。' },
    { src: img('book4/q-learning_2.jpg'), caption: 'Q 学习训练过程中的损失函数变化曲线。随着训练进行，TD 误差逐渐减小趋于收敛，表明 Q 函数越来越准确地逼近真实的最优动作价值函数。' }
  ],
  'dqn': [
    { src: img('book4/dqn_1.jpg'), caption: 'DQN 使用的卷积神经网络架构：游戏画面图像经过多层卷积提取空间特征，再通过全连接层映射到各行动的 Q 值输出。卷积层能自动识别屏幕上的关键视觉模式。' },
    { src: img('book4/dqn_2.jpg'), caption: 'DQN 在倒立摆（CartPole）游戏中每回合奖励的变化曲线。初期探索阶段奖励较低，随着训练推进奖励稳步上升最终趋于稳定，证明 DQN 成功学会了保持平衡的策略。' }
  ]
}

export default bookImages
