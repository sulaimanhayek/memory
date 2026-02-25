---
title: "Chapter 1: Introduction"
slug: introduction
author: Sulaiman Ahmed
date: 2025-07-01
categories: [theory, neuroscience]
image: /posts/welcome/thumbnail.jpg
note: "Theoretical groundwork for episodic memory and core neuroscience concepts."
tag: theory
order: 1
---
# 1.1 Motivation
Imagine taking the train from Brighton to London. The train leaves Brighton station slowly towards the stations on the outskirts of the city centre but then speeds
up towards Gatwick airport. You eventually arrive London’s Blackfriars train sta-
tion. You get off the train and walk through the gates towards the underground.
You hop on the first train towards Westminster, and you sit to reflect on your
trip. What do you remember from this journey? Do you remember the detailed
leafy environment you pass by and the platforms you stop at, or do you remember
glimpses and events of this journey: (1) Platform 8, (2) Seat number, (3) the conductor who asked for your ticket, and (4) probably the person who sat next to you.
Now imagine that you are cycling from Brighton to London. The journey takes
hours; you pass through farms, houses, bars, restaurants, shops and many trees
on the way to London. You will eventually stop for a snack and get hydrated.
The experience is completely different, and you might remember more events
from this journey because you are spending more time, and you’re experiencing a
movement force you’re generating, you could feel pain in your muscles and your
heart beats fast. You will eventually remember much more from this experience,
and you will probably pay more attention to the road as you are the person in
control compared to the train journey. The train driver has a much richer perceptual experience than yours in this case, but attending to very little of it, having
seen it many times. In essence, that is Event Segmentation Theory (EST), which
proposes we perceive and remember experiences by breaking continuous activity
into discrete events (Zacks et al., 2007). According to EST, our brains automatically segment ongoing experiences into meaningful chunks or "events" at points where predictability decreases, such as when goals or locations change (Zacks
et al., 2007). While behavioural and neuroimaging studies have investigated and
identified correlations of the brain during event segmentation, few studies have
investigated how perceptual changes align with subjective experience in naturalistic settings. Understanding event segmentation and how people naturally segment
frames has implications for clinical practice and improving educational materials
such that it’s aligned with how the brain works (Zacks et al., 2007).

Time perception, on the other hand, is an overlooked dimension in the studies of
perception and memory. Evidence from Fountas et al. (2021) study on durations
judgment supported our experiences of phenomena such as "it took forever to get
here" or "It was a fun trip, but it went by so fast", When paying attention to time,
time experience seems to expand; when distracted, it seems to contract (Fountas
et al., 2021). When considering time based on memory, the experience may be
different than in the moment (Fountas et al., 2021). Time estimates differ when
judged prospectively vs. retrospectively and is dependent on how much attention
is paid to time (Roseboom et al., 2024). By emphasizing the importance of sensory
content in time perception, salient "surprise" events approach may provide a link
between time perception and episodic memory that has been lost by content-free
"clock" approaches (Sherman et al., 2022).

Motivated by these challenges, this thesis investigates the role of salient event-boundaries and non-event gaps and the content around these boundaries on re-
membering amongst healthy adults. Event-boundaries are collected, analysed,
and merged from 3 studies: perception census online study, fMRI-based model to
extract salient events, and an artificial network model to extract surprise frames
from the same videos.

# 1.2 Aim and Objectives
The aim of this thesis is to investigate the dynamic role of event boundaries using Behavioural data-driven model and compare it to fMRI-based models and
a computational model, and investigate the commonality of boundaries between
methods, and verify if content around these boundaries is better remembered, as
predicted by EST. To achieve this aim, the following objectives were set:

- Pass naturalistic videos through deep convolutional neural network (CNN) to predict human-segmented events based on the features of the videos.
- Analyse human behavioural event segmentations from over 8,000 participants watching naturalistic videos.
- Extract salient events from fMRI voxel-wise of visual region from human participants watching naturalistic videos.
- Identify boundaries around the events extracted from the 3 methods mentioned above, and conduct online behavioural study to test memory recall in relation to event boundaries
- Analyse memory recall in relation to event boundaries using NLP methods.