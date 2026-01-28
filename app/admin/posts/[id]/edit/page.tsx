'use client';

import { useEffect, useState, use } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/types';
import PostForm from '../../_components/post-form';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPost() {
            if (!id) return;
            const docRef = doc(db, 'posts', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPost({ id: docSnap.id, ...docSnap.data() } as Post);
            }
            setLoading(false);
        }
        fetchPost();
    }, [id]);

    if (loading) return <div>جاري تحميل المقال...</div>;
    if (!post) return <div>المقال غير موجود.</div>;

    return <PostForm post={post} />;
}
