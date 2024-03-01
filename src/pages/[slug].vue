<script setup lang="ts">
	import { useMeta } from 'quasar'
	import { ref } from 'vue'
	import { useRoute } from 'vue-router'

	const pageMeta = {
		// layout: 'default',
		// name: 'slug',
		// alias: 'slug',
		title: ref('Slug'),
		description: 'Slug',
		// hidden: true,
		navOrder: '5',
		type: 'primary',
		icon: 'i-mdi-home',
		// ogImage: 'images/ogImage.png', // url or local images inside public folder, for eg, ~/public/images/ogImage.png
	}

	// import { computed } from 'vue'
	// import { useArticles } from '~/composables/articles'

	// const articleId = useRoute().params.id

	// const { data: article } = await useAsyncData('articles', async () => {
	// 	const { getArticle } = useArticles()
	// 	return await getArticle(+articleId)
	// })

	const route = useRoute()
	const capitalize = s => (s && s[0].toUpperCase() + s.slice(1)) || ''
	useMeta(() => {
		return {
			title: () => capitalize(route.params.slug),
		}
	})
</script>

<template>
	<q-page padding>
		<div style="min-height: 100px; display: flex; align-items: center; justify-content: center; font-weight: bold">
			<span style="color: #0198cd">slug.vue (Quasar 2.14)</span>
		</div>
	</q-page>
</template>

<style scoped></style>

