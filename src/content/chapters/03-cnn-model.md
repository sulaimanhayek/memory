---
title: "Chapter 3: CNN Model"
slug: cnn-model
author: Sulaiman Ahmed
date: 2025-08-01
categories: [deep learning, modelling]
image: /posts/welcome/thumbnail.jpg
note: "A convolutional approach to identifying event boundaries from video."
tag: deep learning
order: 3
---
# 3.1 Introduction
Artificial Intelligence (AI) applications are growing at an unprecedented speed due to the recent development in neural networks and powerful GPU systems. The theoretical and engineering developments are progressing at a fast pace and many of the insights gained in engineering will likely be relevant for brain theory (Kriegeskorte, 2015). Computer vision has recently come to be dominated by a particular type of deep neural network: the deep feedforward convolutional network, Like the primate ventral visual stream, these networks process information through a deep hierarchy of representations (Kriegeskorte, 2015). The layers of the network gradually transfer the image – which is equivalent to a visual representation – into semantic representation that enables the recognition of object categories. In this chapter we present the working model and architecture of AlexNet, a deep convolutional neural network (CNN), that has the same resemblance of the human visual system. As we have seen in section 2.4 of Chapter 2 our feeling of time is not like a clock. It depends on the type of activity we're experiencing. Thus, time can slow down or speed up based on the perceptual experience we're having, for example the perception of time in an office is different from that in the city or in the park. To test this proposal Roseboom et al. (2019) developed an experimental approach (see figure 3.1) to compare human time estimations with a feed-forward image classification network (AlexNet) that processes the same videos viewed by human participants.

In this model, salient events are extracted from video frames based on attention decay and Euclidean distances between past (t − τ) and current (t) frames of tracked layers. Figure 3.2 depicts the time estimation model explaining the derivation of salient events, and the mechanism of attention threshold and euclidean distances across the frames. Attention is used to control whether a new feature is detected, and Euclidean distance is calculated between the moving average of recent neuronal states in each of four chosen layers of the network and the new state corresponding to the current observed scene. If the distance exceeds the adaptive threshold value, a new feature is registered in the accumulator of the corresponding layer and the threshold is reset (Roseboom et al., 2019). A pre-trained regression model is used to process accumulated features and estimate physical duration.

# 3.2 CNN-based model
The artificial deep neural network CNN-based model, is the first building block of our project (see figure 1.1). The model is adapted from, and builds on top of the model developed by Roseboom et al (2019). In principle, it's the same exact system depicted in figure 3.2, excluding the accumulation of changes over time and the regression components.

We use AlexNet, a pre-trained (i.e. not trained on our video frames) hierarchical image classification network, that has 5 convolutional layers, and 3 fully-connected layers (Krizhevsky et al., 2012). In our code implementation, torchvision version of AlexNet is loaded. Table 3.1 below shows the type and size of each layer.

| Layer Name (PyTorch) | Type | Output Size |
|---|---|---|
| features.0 | Conv2d (conv1) | 64 filters |
| features.3 | Conv2d (conv2) | 192 filters |
| features.6 | Conv2d (conv3) | 384 filters |
| features.8 | Conv2d (conv4) | 256 filters |
| features.10 | Conv2d (conv5) | 256 filters |
| classifier.1 | Linear (fc6) | 4096 units |
| classifier.4 | Linear (fc7) | 4096 units |
| classifier.6 | Linear (fc8), Output | 1000 logits |

*Table 3.1: AlexNet layers, implemented in PyTorch and loaded to our code via pip package manager.*

We calculated frame-to-frame Euclidean distances in the network activity and tracked 3 layers: Conv5, fc6, and fc7 (see AlexNet architecture, figure 3.3). We tested each of the tracked layers on generating surprise events and concluded that best layer to control what to store as salient is fc7, the last layer prior to output. Earlier layers capture edge patterns, which change frequently, and cause our model to produce many events that are not meaningful to use. We found fc7 correspond to sudden changes in the scene (i.e., from traffic light, to pedestrians walking) that is similar to human annotated surprise events. Note that a salient change is not necessarily psychologically salient, nor even a salient change in the environment; it is simply a relatively extreme change in dynamics (Sherman et al., 2022).

Videos are first transferred into frames at a rate of 30 frames per second, then passed into the model. At each frame, we flatten the vector that correspond to fc7, and then L2 difference is calculated. The output of L2 difference represents a surprise score, when this score exceeds a predetermined threshold, it will be counted as a "surprise event" and logs the following information:
- Frame number
- Timestamp in seconds
- Layer name
- Surprise score
- Class label (based on AlexNet classification)

# 3.3 AlexNet Architecture
In the previous section, we explained the adaptation of the event segmentation model from the time estimation model presented earlier in figure 2.4. In this section, we are introducing the overall architecture of AlexNet model, and some of the technical decisions we have made to adjust the overall model we adapted from (Roseboom et al., 2019).

AlexNet was introduced in 2012 when the authors presented the paper "ImageNet Classification with Deep Convolutional Neural Networks" at the NIPS (Neural Information Processing Systems) 2012 conference (Krizhevsky et al., 2012). AlexNet model was trained on the 1.2 million high resolution images of the ImageNet LSVRC 2010/2012 challenges and achieved a top 1 error of 37.5 per cent and a top 5 error of 17 per cent on the test set, far surpassing previous methods (Krizhevsky et al., 2012). Figure 3.3 shows the overall architecture of AlexNet with its corresponding layers.

# 3.4 Salient (surprise) events
Surprise events are governed by attention threshold and L2 norm. Each frame is resized to 224 × 224 and then passed to the network, and L2 distance is calculated between the activation vector of current frame and previous frame. If the score is less than 1, it will be ignored. Otherwise, the script will update a per-layer attention threshold which starts at 0.9 and decreases over time according to this equation:

$$decay = \frac{max - min}{\tau} \cdot e^{-D/\tau}$$

where:
- max = 0.9
- min = 0.1
- τ = 60
- D is the number of frames since the last surprise layer.

$$surprise\_score = ||a_t - a_{t-1}||_2 = \sqrt{\sum_{i=1}^{n}(a_{t,i} - a_{t-1,i})^2}$$

where:
- $a_t$: flattened activation vector for the current frame.
- $a_{t-1}$: flattened activation vector for the previous frame.

If the surprise_score ≥ attention_threshold[layer] it will be registered as a surprise event, and the attention threshold is reset to 0.9 again.
