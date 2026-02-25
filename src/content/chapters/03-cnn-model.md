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

Convolutional neural networks (CNNs) have become a cornerstone of modern computer vision, and their hierarchical feature representations offer a compelling analogy to the ventral visual stream in the human brain. In this chapter, we describe how a CNN-based model is used to automatically segment continuous video into discrete events.

The approach relies on extracting frame-level feature representations from a pre-trained deep network and computing the dissimilarity between successive frames. When the representational distance crosses a threshold, the model registers an event boundary — a moment where the visual content has changed sufficiently to warrant a new memory unit.

We evaluate the model's boundary predictions against human-annotated segmentation data, examining both the precision and recall of detected boundaries. The results indicate that mid-level CNN features, corresponding roughly to object and scene representations, yield the best alignment with human judgements.

This chapter also discusses the limitations of purely feedforward CNN models for event segmentation, including their insensitivity to temporal context and narrative structure, motivating the exploration of alternative modelling approaches in subsequent chapters.
