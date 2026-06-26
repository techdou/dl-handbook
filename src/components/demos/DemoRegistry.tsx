import React from 'react'
import PerceptronDemo from './PerceptronDemo'
import NeuralNetworkDemo from './NeuralNetworkDemo'
import BackpropagationDemo from './BackpropagationDemo'
import TrainingDemo from './TrainingDemo'
import CnnDemo from './CnnDemo'
import MnistDemo from './MnistDemo'
import ComputationGraphDemo from './ComputationGraphDemo'
import AutogradDemo from './AutogradDemo'
import LayersDemo from './LayersDemo'
import OptimizerDemo from './OptimizerDemo'
import Word2VecDemo from './Word2VecDemo'
import RnnDemo from './RnnDemo'
import LstmDemo from './LstmDemo'
import Seq2SeqDemo from './Seq2SeqDemo'
import AttentionDemo from './AttentionDemo'
import RlBasicsDemo from './RlBasicsDemo'
import MdpDemo from './MdpDemo'
import QLearningDemo from './QLearningDemo'
import DqnDemo from './DqnDemo'

const demos: Record<string, React.ComponentType> = {
  'perceptron': PerceptronDemo,
  'neural-network': NeuralNetworkDemo,
  'backpropagation': BackpropagationDemo,
  'training': TrainingDemo,
  'cnn': CnnDemo,
  'mnist': MnistDemo,
  'computation-graph': ComputationGraphDemo,
  'autograd': AutogradDemo,
  'layers': LayersDemo,
  'optimizer': OptimizerDemo,
  'word2vec': Word2VecDemo,
  'rnn': RnnDemo,
  'lstm': LstmDemo,
  'seq2seq': Seq2SeqDemo,
  'attention': AttentionDemo,
  'rl-basics': RlBasicsDemo,
  'mdp': MdpDemo,
  'q-learning': QLearningDemo,
  'dqn': DqnDemo
}

export default function DemoRegistry({ demoId }: { demoId: string }) {
  const Demo = demos[demoId]

  if (!Demo) {
    return (
      <section style={{ border: '1px solid var(--rule)', padding: 16, background: 'var(--paper-card)' }}>
        未找到演示：{demoId}
      </section>
    )
  }

  return <Demo />
}
